# 部署、切流与数据备份

> 适用于 `torzo-qun`（同装导册 v2）：Vite + React 静态资源 + Cloudflare Workers + D1。
>
> 最后更新：2026-11-15
>
> 本文分两部分：
> 1. **从零部署到线上**
> 2. **新站 D1 数据的备份与恢复**（重点）
>
> 先记住一句话：**新站的留言数据在 Cloudflare D1，不在旧 MySQL；`pnpm migrate:comments` 只是旧站导入脚本，不是新站备份工具。**

## 0. 当前生产参数

| 项目 | 值 |
|---|---|
| Worker | `torzo-qun` |
| D1 数据库 | `torzo-qun-db` |
| D1 binding | `DB`（代码里是 `env.DB`） |
| D1 ID | 见 [`wrangler.jsonc`](../wrangler.jsonc) |
| 正式域名 | `guide.torzo.club` |
| 短域名 | `qun.torzo.club` → `guide.torzo.club`，应为 **301** |
| 后台 | `https://guide.torzo.club/admin` |
| 后台保护 | Cloudflare Access，路径 `admin*` + `api/admin*` |
| 留言 API | `https://guide.torzo.club/api/comments?page=1` |
| 旧接口兼容 | `https://guide.torzo.club/comment?page=1` |
| 本地前端 | `http://127.0.0.1:5180` |
| 本地 Worker | `http://127.0.0.1:8787` |

> **当前状态（2026-11-15 更新）**：`guide.torzo.club` 已切到新 Worker，Access 正常；远程 D1 有 67 条留言。当前正在排查“Turnstile 组件显示成功、但 POST /api/comments 返回 503”的问题，见第 10 节“留言 POST 返回 503”。`qun.torzo.club` 的 DNS/301 请在 Cloudflare Dashboard 再确认。

`wrangler.jsonc` 是**部署配置**，应该提交到 Git。  
D1 的 `database_id` 不是访问凭证，也不是密码；没有 Cloudflare 账户权限的人拿到它也无法访问数据库。真正不能提交的是：

- `TURNSTILE_SECRET_KEY`
- `IP_HASH_SALT`
- `CLOUDFLARE_API_TOKEN`
- `.dev.vars`
- `.env.production`

## 1. 前置条件

- Cloudflare 账户拥有 `torzo.club` 这个 zone
- 已启用 Workers、D1、Turnstile、Zero Trust Access
- 本地 Node 26 + pnpm 12
- 已登录 Wrangler：

```bash
cd /Users/vec/torzo/Torzo-qun
pnpm install
pnpm exec wrangler login
pnpm exec wrangler whoami
```

`whoami` 至少要有：

- Workers Scripts: Edit
- Workers Routes: Edit（用 route 时需要）
- D1: Edit
- Zone: Read

不要用 `wrangler login` 的 OAuth token 做 CI；CI 单独建 API Token。

## 2. 创建和绑定 D1

如果是全新环境：

```bash
pnpm exec wrangler d1 create torzo-qun-db
```

把输出里的 `database_id` 填进 [`wrangler.jsonc`](../wrangler.jsonc)：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "torzo-qun-db",
    "database_id": "<真实 database_id>",
    "migrations_dir": "migrations"
  }
]
```

注意：

- `binding` 必须是 `DB`，因为代码里是 `env.DB`。
- `wrangler d1 create` 默认建议的 `torzo_qun_db` 只是建议名，不要和 `DB` 同时保留。
- `migrations_dir` 必须有，否则 `d1 migrations apply` 找不到迁移文件。
- 同一数据库不要配置两个 binding。

应用迁移：

```bash
pnpm exec wrangler d1 migrations apply torzo-qun-db --remote
pnpm exec wrangler d1 migrations list torzo-qun-db --remote
```

预期：

```text
✅ No migrations to apply!
```

当前远程库的基线是 67 条旧留言，`id` 范围 1–79，缺 3–11、25、54、55。  
缺的 id 是旧库已删除的数据，HTTP 接口取不回来。

## 3. Turnstile

### 3.1 创建 widget

Cloudflare Dashboard → Turnstile → Add widget：

```text
Name: torzo-qun
Mode: Managed
Hostnames:
  guide.torzo.club
  localhost
  torzo-qun.<account>.workers.dev   # 如果要在 workers.dev 预览
```

拿到两个值：

- **Site Key**：公开，构建进前端
- **Secret Key**：私有，放到 Worker secret

### 3.2 写入 Worker secret

```bash
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

按提示粘贴 Secret Key。  
再设置 IP 哈希盐：

```bash
openssl rand -hex 32
pnpm exec wrangler secret put IP_HASH_SALT
```

确认只有名字、不显示值：

```bash
pnpm exec wrangler secret list
```

### 3.3 构建时写入 site key

`.env.production` 已被 gitignore：

```bash
printf 'VITE_TURNSTILE_SITE_KEY=%s\n' '0x你的SiteKey' > .env.production
```

不要使用 `.env.example` 里的 `1x000...AA` 测试 key 上生产。

`TURNSTILE_ENABLED` 和 `ALLOW_TURNSTILE_FALLBACK` 在 `wrangler.jsonc` 的 `vars` 里：

```jsonc
"vars": {
  "ENVIRONMENT": "production",
  "TURNSTILE_ENABLED": "true",
  "ALLOW_TURNSTILE_FALLBACK": "true"
}
```

如果 Turnstile 组件没加载出来，会因为 `turnstile_unavailable` 走更严格的降级限流，不会直接允许无限制提交。但生产环境应当让 widget 正常加载。

### 3.4 `IP_HASH_SALT` 是什么

它不是密码，也不是 Turnstile secret。  
它用于给访客 IP 做单向哈希：

```text
SHA-256(salt + 日期 + IP)
```

数据库只存 `ip_hash`，不存真实 IP，用于限流和冷却。  
这个值要稳定；换掉后旧的 IP 哈希对不上，频率限制会重置，但不会影响留言内容。

## 4. Cloudflare Access

只保护后台，不要保护整个站点。

在 Zero Trust → Access → Applications → Add an application 中，选择：

```text
自托管和私有 → 公共 DNS
```

不要选“私有目标”（那是内网 IP / Tunnel）；也不要选“Workers”（会变成整个 Worker 的保护）。

### 4.1 后台页面应用

```text
Application name: torzo-qun admin
Domain: guide.torzo.club
Path: admin*
Session duration: 24 hours
```

策略：

```text
Action: Allow
Include: Emails
Value: 你的邮箱
```

登录方式用默认的 One-time PIN。

### 4.2 后台 API 应用

```text
Application name: torzo-qun admin api
Domain: guide.torzo.club
Path: api/admin*
Session duration: 24 hours
Policy: 复用上一个 allow 策略
```

验证：

```bash
curl -I https://guide.torzo.club/admin
curl -I https://guide.torzo.club/api/admin/comments?page=1
```

两个都应该是 302 到 `https://torzo.cloudflareaccess.com/...`。

Worker 自身在 [`worker/http.ts`](../worker/http.ts) 还会检查：

```text
Host 必须是 guide.torzo.club 或 qun.torzo.club
必须有 Cf-Access-Authenticated-User-Email
必须有 Cf-Access-Jwt-Assertion
```

所以：

- 通过 `workers.dev` 访问后台 API 返回 403，这是故意的
- 没有配 Access 时，后台 API 返回 403
- Access 页面能打开但 API 403，通常是 `api/admin*` 应用没配

## 5. 构建与预览

### 5.1 先跑检查

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### 5.2 检查 D1 绑定和 Turnstile 注入

```bash
pnpm exec wrangler deploy --dry-run --outdir /tmp/qun-dry-run
```

输出里应有：

```text
env.DB (torzo-qun-db)  D1 Database
```

确认 site key 进了构建产物（不要在命令输出里打印 key）：

```bash
python3 - <<'PY'
from pathlib import Path
key = ''
for line in Path('.env.production').read_text().splitlines():
    if line.startswith('VITE_TURNSTILE_SITE_KEY='):
        key = line.split('=', 1)[1].strip()
assets = list(Path('dist/assets').glob('*.js'))
print(any(key and key in p.read_text(errors='ignore') for p in assets))
PY
```

### 5.3 部署预览

```bash
pnpm exec wrangler deploy
```

Wrangler 会输出：

```text
https://torzo-qun.<account>.workers.dev
```

预览检查：

- 首页是新的 Aqua 版
- `/api/comments?page=1` 返回远程 D1 的留言
- 留言板能加载
- 发一条测试留言，后台能看到
- 删除测试留言
- `/admin` 在 workers.dev 上返回 403 是正常的
- 如果 Turnstile 提示未加载，把 workers.dev hostname 加进 widget，或忽略，正式域名会正常

中国网络下 `workers.dev` 有时无法访问；这不代表部署失败。可以直接走第 7 节的 `guide` route 验证。

## 6. 旧留言迁移（只在切流前做）

**必须在 `guide.torzo.club` 还指向旧站时做。**  
一旦挂上新的 Worker route，旧 API 就被新 Worker 接管，`pnpm migrate:comments` 读到的就不是旧数据了。

```bash
pnpm migrate:comments --dry-run
pnpm migrate:comments
pnpm exec wrangler d1 execute torzo-qun-db --remote --file=./data/import.sql
```

脚本会：

- 从 `https://guide.torzo.club/comment?page=n` 逐页读取
- 生成 `data/legacy-comments.json`、`.sha256`、`data/import.sql`
- 用 `INSERT OR IGNORE`，可重复执行

验证：

```bash
pnpm exec wrangler d1 execute torzo-qun-db --remote \
  --command "SELECT COUNT(*) AS total, MIN(id) AS min_id, MAX(id) AS max_id FROM comments;"
```

切流当天再做一次 delta，把最后一次旧站留言带过来：

```bash
pnpm migrate:comments
pnpm exec wrangler d1 execute torzo-qun-db --remote --file=./data/import.sql
```

注意：**切流后不要再把 `migrate:comments` 当备份用。** 它只负责旧站导入。

## 7. 切换线上域名

### 7.1 推荐：Worker Route，不改 DNS

在 `wrangler.jsonc` 加：

```jsonc
"routes": [
  { "pattern": "guide.torzo.club/*", "zone_name": "torzo.club" }
]
```

然后：

```bash
pnpm build
pnpm exec wrangler deploy
```

这样 `guide.torzo.club` 的现有 DNS 不动，route 覆盖到新 Worker。  
出问题时删除 route 就能立刻回到旧 origin。

### 7.2 备选：Custom Domain

```jsonc
"routes": [
  { "pattern": "guide.torzo.club", "custom_domain": true }
]
```

这会改 DNS，回滚不如 route 方便。  
如果 `guide` 已有旧的 A/AAAA 记录，Custom Domain 可能需要先处理冲突；第一次上线不建议。

### 7.3 切流后验证

```bash
curl -I https://guide.torzo.club/
curl https://guide.torzo.club/api/comments?page=1
curl https://guide.torzo.club/comment?page=1
```

浏览器无痕窗口：

```text
https://guide.torzo.club/          # 新 Aqua 首页
https://guide.torzo.club/guestbook # 独立留言板
https://guide.torzo.club/admin     # 先跳 Access，登录后进后台
https://guide.torzo.club/nope      # 自定义 404
```

首页不要再看得到旧的：

```text
style/global.css
script/frame.js
```

应该看到新的 `/assets/index-*.js` 和 `/assets/index-*.css`。

再发一条测试留言，确认：

- Turnstile 正常显示
- 留言出现在首页/留言板
- 后台能看到、能删除
- 删除后总数正确

### 7.4 qun 改 301

Cloudflare Dashboard → Rules → Redirect Rules：

```text
qun.torzo.club/* → https://guide.torzo.club/$1  301
```

现在线上还是 302，需要改。验证：

```bash
curl -I https://qun.torzo.club/
```

预期：

```text
HTTP/2 301
location: https://guide.torzo.club/
```

### 7.5 关掉 workers.dev

确认 `guide` 正常后，把 `wrangler.jsonc` 改成：

```jsonc
"workers_dev": false
```

再部署一次。这样预览域名不再暴露；正式访问只走 `guide`。

## 8. 新站数据备份（重点）

### 8.1 先分清三个东西

| 数据 | 位置 | 备份方式 |
|---|---|---|
| 新站留言 | 远程 D1 `torzo-qun-db` | D1 export + Time Travel |
| 旧站留言 | 旧 MySQL / 旧接口 | 已经导入；不是新站备份目标 |
| 页面/代码 | Git | Git 仓库 |
| Turnstile secret / IP salt | Cloudflare secret | 密码管理器；不是 D1 备份 |

**新站上线后，唯一的留言数据源是 D1。**  
不要再用旧 MySQL 的 `sqldump`，也不要把 `data/legacy-comments.json` 当新站备份。

### 8.2 逻辑导出（主备份）

Cloudflare 官方命令是 `wrangler d1 export`。  
它会导出 D1 的 schema + data 为 `.sql`，可以用 `wrangler d1 execute --file` 恢复。

```bash
cd /Users/vec/torzo/Torzo-qun

mkdir -p data/backups

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="data/backups/torzo-qun-${STAMP}.sql"

pnpm exec wrangler d1 export torzo-qun-db \
  --remote \
  --output="./${BACKUP}" \
  --skip-confirmation

shasum -a 256 "./${BACKUP}" > "./${BACKUP}.sha256"
```

说明：

- `data/` 已被 gitignore；不要提交备份。
- `--remote` 才是线上 D1；不带 `--remote` 是本地开发库。
- `--skip-confirmation` 避免交互确认。
- 备份文件包含 `CREATE TABLE` 和 `INSERT INTO`；不需要用 `sqldump`。
- 备份包含 `ip_hash`，虽然不含真实 IP，仍按个人信息保护，不要公开。

### 8.3 校验备份

```bash
ls -lh "data/backups/torzo-qun-${STAMP}.sql"

# 应该有 CREATE TABLE comments、索引和 INSERT
grep -c 'INSERT INTO' "data/backups/torzo-qun-${STAMP}.sql"
grep 'CREATE TABLE' "data/backups/torzo-qun-${STAMP}.sql"

# 当前线上计数，和备份时的计数对一下
pnpm exec wrangler d1 execute torzo-qun-db --remote \
  --command "SELECT COUNT(*) AS total, MAX(id) AS max_id, MAX(created_at) AS latest FROM comments;"
```

建议在备份文件名旁边记一条小文本：

```text
backup: torzo-qun-20261115-060000.sql
total: 67
max_id: 79
bookmark: <time-travel bookmark>
```

### 8.4 备份时机

至少在这些时候做：

1. **切 `guide` 之前**（当前 67 条）
2. 最后一次旧站 delta 之后
3. 切 `guide` 成功后
4. 每次执行 D1 migration 之前
5. 每次手工删除留言之前
6. 日常：每天或每周一次；至少保留最近 7 天的每日备份

免费版 Time Travel 只有 **7 天**，不能替代长期 SQL 备份。  
建议本地/私有存储保留 30–90 天，重要节点另存一份。

### 8.5 Time Travel（快速回滚）

D1 Time Travel 是 Cloudflare 自带的按时间点恢复：

- Workers Free：最近 **7 天**
- Workers Paid：最近 **30 天**
- 不额外收费
- 恢复会覆盖当前数据库，属于破坏性操作

查看当前 bookmark：

```bash
pnpm exec wrangler d1 time-travel info torzo-qun-db --json
```

查看某个时间点的 bookmark：

```bash
pnpm exec wrangler d1 time-travel info torzo-qun-db \
  --timestamp "2026-11-15T05:00:00Z" \
  --json
```

恢复：

```bash
pnpm exec wrangler d1 time-travel restore torzo-qun-db \
  --bookmark "<bookmark>"
```

或：

```bash
pnpm exec wrangler d1 time-travel restore torzo-qun-db \
  --timestamp "2026-11-15T05:00:00Z"
```

恢复前先把当前 bookmark 记下来，恢复后再确认：

```bash
pnpm exec wrangler d1 execute torzo-qun-db --remote \
  --command "SELECT COUNT(*) AS total, MAX(id) AS max_id FROM comments;"
```

Time Travel 只适用于**同一个 D1 数据库**。如果数据库被删除，必须用 SQL 备份恢复。

### 8.6 从 SQL 备份恢复

不要直接把完整 dump 导入已有表的线上库；`CREATE TABLE` 会冲突。安全做法是恢复到一个新库：

```bash
# 1. 建临时恢复库
pnpm exec wrangler d1 create torzo-qun-db-restore

# 2. 导入备份
pnpm exec wrangler d1 execute torzo-qun-db-restore \
  --remote \
  --file="./data/backups/torzo-qun-20261115-060000.sql"

# 3. 校验
pnpm exec wrangler d1 execute torzo-qun-db-restore \
  --remote \
  --command "SELECT COUNT(*) AS total, MIN(id) AS min_id, MAX(id) AS max_id FROM comments;"

# 4. 确认无误后，把 wrangler.jsonc 的 database_id 改成恢复库的 ID
# 5. 重新部署
pnpm build
pnpm exec wrangler deploy
```

恢复库验证通过前，不要删原库。  
切换 binding 后，原库先保留至少 7 天，作为二次回滚。

### 8.7 secret 备份

`wrangler secret list` 只显示名字，不显示值。  
`TURNSTILE_SECRET_KEY`、`IP_HASH_SALT` 不要试图从 D1 或代码里恢复；创建时就要存进密码管理器。

如果丢失：

- Turnstile secret：在 Turnstile Dashboard 轮换，重新 `wrangler secret put`
- IP salt：重新生成并 `wrangler secret put`；旧的频率限制记录对不上，会重置，但留言不丢

## 9. 日常发布流程

```bash
# 1. 检查
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# 2. 先备份新站 D1
STAMP=$(date +%Y%m%d-%H%M%S)
pnpm exec wrangler d1 export torzo-qun-db \
  --remote \
  --output="./data/backups/torzo-qun-${STAMP}.sql" \
  --skip-confirmation

# 3. 如果本次有 D1 migration
pnpm exec wrangler d1 migrations apply torzo-qun-db --remote

# 4. 部署
pnpm exec wrangler deploy

# 5. 验证 /api/comments、/admin、首页
```

如果只是改页面，不涉及 D1：备份可选，但建议保留最近一份。

回滚 Worker：

```bash
pnpm exec wrangler rollback
```

## 10. 故障排查

### `/admin` 返回 403

- 是否通过 `guide.torzo.club` 访问
- 是否配了 `admin*` 和 `api/admin*` 两个 Access 应用
- 是否登录了 Access
- 通过 `workers.dev` 访问后台 API 是 403，正常

### 留言 API 正常但页面空白

- 看 `/api/comments?page=1` 是否 200
- 看浏览器 console 是否有 CSP 错误
- Turnstile 是否加载；CSP 是否允许 `challenges.cloudflare.com`

### 留言 POST 返回 503 `SERVICE_UNAVAILABLE`

现象：Turnstile 小组件显示绿色“成功”，但提交留言时：

```json
{"error":{"code":"SERVICE_UNAVAILABLE","message":"验证服务暂时不可用，请稍后再试"}}
```

这不是浏览器 token 的问题；是 Worker 调 Turnstile `siteverify` 失败。最常见的原因是 **`TURNSTILE_SECRET_KEY` 和前端 site key 不是同一个 widget**：

- 用了 `.dev.vars` 里的测试 secret，但前端用的是生产 site key
- 用了另一个 Turnstile widget 的 secret
- 复制 secret 时带了引号、空格或换行
- 在 Dashboard 轮换过 secret，但 Worker 没更新

503 和 403 的区别：

- `403 TURNSTILE_FAILED`：token 无效/过期/已用过，或 hostname 不匹配
- `503 SERVICE_UNAVAILABLE`：`siteverify` 请求本身失败；通常是 secret 无效（HTTP 400）或网络/响应异常

修复：

1. Dashboard → Turnstile → 找到 site key 与 `.env.production` 中 `VITE_TURNSTILE_SITE_KEY` 一致的 widget
2. 打开 → Settings → Secret Key，复制 **Secret Key**；如果看不到，直接 Rotate Secret
3. 重新写入，不要带引号：

```bash
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

4. 重新部署：

```bash
pnpm exec wrangler deploy
```

5. 刷新页面，重新完成 Turnstile，再提交

如果仍然 503，在提交的同时运行：

```bash
pnpm exec wrangler tail --format pretty
```

把 Worker 日志发出来。当前 `qunTurnstileVerify` 只返回 503，不打印底层原因；必要时可以在 [`worker/routes/comments.ts`](../worker/routes/comments.ts) 的 `assertTurnstile` 里临时加一行 `console.error(verification.error.code, verification.error.message)`，再部署观察。

> `.dev.vars` 里的 `TURNSTILE_SECRET_KEY` 只用于本地测试；不要复制到生产 Worker secret。

### D1 绑定错

```bash
pnpm exec wrangler deploy --dry-run
```

必须是：

```text
env.DB (torzo-qun-db)
```

不是 `torzo_qun_db`，也不是占位 ID。

### qun 还是 302

在 Cloudflare Redirect Rules 里把状态码改成 301；如果旧 302 是 origin 返回的，切到 Worker 后要在 Cloudflare 侧补规则。

### workers.dev 打不开

中国网络常见。直接走 `guide` route；不需要为了预览卡住切流。

### Access 登录后仍然 403

- Access 应用路径是否覆盖当前 URL
- 是否只保护了 `admin*`，漏了 `api/admin*`
- Worker 的 Host 检查是否通过

## 11. 当前这次上线的剩余步骤

截至 2026-11-15：

- [x] 远程 D1 建表
- [x] 旧留言导入 67 条
- [x] `TURNSTILE_SECRET_KEY` / `IP_HASH_SALT`
- [x] Access 两个应用验证通过
- [x] Worker 预览部署（`workers.dev`）
- [x] `guide.torzo.club` 已切到新 Worker（如果通过 Dashboard 加 route/custom domain，记得回写到 `wrangler.jsonc`）
- [x] 切流前后各做一份新站 D1 备份
- [ ] 修复 Turnstile 503，提交一条测试留言
- [ ] 验证后台删除、404、移动端
- [ ] `qun.torzo.club` 的 DNS/301
- [ ] `workers_dev: false` 并重新部署

切流前最后一遍：

```bash
# 1. 最后一次旧站 delta（此时 guide 仍是旧站）
pnpm migrate:comments
pnpm exec wrangler d1 execute torzo-qun-db --remote --file=./data/import.sql

# 2. 备份新站 D1
mkdir -p data/backups
STAMP=$(date +%Y%m%d-%H%M%S)
pnpm exec wrangler d1 export torzo-qun-db \
  --remote \
  --output="./data/backups/torzo-qun-${STAMP}.sql" \
  --skip-confirmation

# 3. 加 route 后
pnpm build
pnpm exec wrangler deploy

# 4. 验证
curl -I https://guide.torzo.club/
curl https://guide.torzo.club/api/comments?page=1
curl -I https://guide.torzo.club/admin
```

## 12. 参考

- D1 Export / Import：<https://developers.cloudflare.com/d1/best-practices/import-export-data/>
- D1 Time Travel：<https://developers.cloudflare.com/d1/reference/time-travel/>
- Workers Static Assets：<https://developers.cloudflare.com/workers/static-assets/>
- Turnstile：<https://developers.cloudflare.com/turnstile/>
- Cloudflare Access：<https://developers.cloudflare.com/cloudflare-one/applications/>
