# 同装导册 v2

同装会的导册与留言板。Vite + React + TypeScript 前端，Cloudflare Workers + D1 后端，全部在免费套餐内运行。

- 线上域名：`https://guide.torzo.club/`（`qun.torzo.club` 301 过来）
- 留言管理：`/admin`（由 Cloudflare Access 保护）
- 旧版：`classic-v1-php`、`classic-v1-node` 分支保留，不随 v2 改动

## 技术栈

| 层 | 选择 |
|---|---|
| 前端 | React 19、TypeScript、Vite 7、React Router 7（library 模式） |
| 样式 | 手写 CSS + CSS 变量，无 UI 框架、无外部字体 |
| 预渲染 | `vite-node` + `renderToString`，生成 `/`、`/guestbook`、`/admin`、`/404.html` |
| API | Hono 4、Zod 4 |
| 数据 | Cloudflare D1（SQLite） |
| 静态资源 | Workers Static Assets（页面请求免费、不触发 Worker） |
| 防刷 | Turnstile（可降级）+ 蜜罐 + 停留时间 + D1 频率限制 + 幂等 client id |
| 管理 | Cloudflare Access（`/admin`、`/api/admin/*`） |

页面本身是静态资源；只有 `/api/*` 和旧 `/comment` 会调用 Worker。

## 常见问题：`pnpm` 本身启动失败（Corepack 缓存）

如果切换 Node 后运行 `pnpm dev` / `pnpm db:migrate:local` 直接报：

```text
Error: Cannot find module '/Users/.../.cache/node/corepack/v1/pnpm/12.18.0/bin/pnpm.cjs'
```

这不是项目脚本的问题，而是 shell 命中了旧的 Corepack shim。Corepack 0.36 与 pnpm 12 的新包布局不兼容，缓存里只有 `pnpm.mjs`，shim 却去找 `pnpm.cjs`。

先确认：

```bash
which -a pnpm
/Users/vec/Library/pnpm/pnpm -v
```

这台机器上独立安装的 pnpm 可用（Node 24 / Node 26 都已验证）；Node 26.13.1 的 nvm 目录也装了一份 pnpm 12.18.0，`nvm use 26.13.1` 后 `which pnpm` 应指向 `~/.nvm/versions/node/v26.13.1/bin/pnpm`。如果 shell 还缓存着旧的 `/usr/local/bin/pnpm`，先执行 `hash -r`（zsh 也可 `rehash`）或重开终端。

独立 pnpm 的用法：

```bash
/Users/vec/Library/pnpm/pnpm dev
/Users/vec/Library/pnpm/pnpm db:migrate:local
```

想永久修好，把 pnpm 放到 PATH 前面（放在 nvm 初始化之后）：

```bash
export PNPM_HOME="$HOME/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
exec zsh
which pnpm   # 应该指向 /Users/vec/Library/pnpm/pnpm
```

或者升级 Corepack 后执行 `corepack prepare pnpm@12.18.0 --activate`。不建议直接改 `packageManager` 降级 pnpm，lockfile 会不一致。

`pnpm dev` 内部已经改成直接调用 `vite` / `wrangler`，不再嵌套调用 `pnpm`，所以用独立 pnpm 启动时不会再次命中坏掉的 shim。

## 界面

前端视觉从 `torzo-aqua` 移植：

- `/`：海面、气泡、开场水晶球、玻璃折叠条、白纸内容面板；八章导册 + 第 09 折「留言板」，留言板直接嵌入首页。
- `/guestbook`：独立留言板页，复用同一套 Aqua 留言组件。
- `/admin`：留言管理，显示总数、删除留言，Cloudflare Access 保护。
- `#foot`：页脚里保留 `管理员入口`，右侧是 `旧版导册` 链接。
- `/legacy/`：`classic-v1-node` 的经典旧版静态存档，HTML/CSS/JS 原样保留；留言读取现有 D1 数据，旧版编辑器只读，提交会提示回新版留言。页脚入口默认新标签页打开。
- 桌面和手机都使用 Aqua 主题；无 JS 时通过 `noscript` 展开全部正文并隐藏开场。

## 本地开发

要求 Node 24（CI 使用）或 Node 26，pnpm 12。

```bash
pnpm install
cp .dev.vars.example .dev.vars
pnpm db:migrate:local
pnpm dev
```

`pnpm dev` 会同时启动：

- Vite：`http://127.0.0.1:5180/`
- Wrangler（Worker + 本地 D1）：`http://127.0.0.1:8787/`

Vite 会把 `/api`、`/comment` 代理到 8787。也可以分开跑：

```bash
pnpm dev:web
pnpm dev:worker
```

本地演示数据（可选）：

```bash
pnpm db:seed:local
```

本地默认关闭 Turnstile、开启降级模式；生产环境必须配置 Turnstile。

## 常见问题：`pnpm db:migrate:local`

- **第一次执行会问一次是否继续**，输入 `y` 回车即可；CI / 非交互环境会自动继续。这不是卡住。
- **`wrangler: command not found`**：先跑 `pnpm install`（wrangler 是项目依赖）。
- **`database is locked` / `SQLITE_BUSY`**：先 `Ctrl-C` 停掉正在运行的 `pnpm dev` 或 `wrangler dev`，再执行迁移。
- **`No migrations to apply!`**：不是错误，本地 D1 已经迁移过了。
- **想看真实报错**，绕开 package script 直接跑：
  ```bash
  pnpm exec wrangler d1 migrations apply torzo-qun-db --local
  ```
- 确认当前目录是仓库根目录（有 `wrangler.jsonc` 的那一层）。
- 本地 D1 文件在 `.wrangler/state/v3/d1/`；如果本地测试数据坏了，可以只删本地状态重来（不影响线上）：
  ```bash
  rm -rf .wrangler/state/v3/d1
  pnpm db:migrate:local
  pnpm db:seed:local   # 可选，重新塞演示数据
  ```

## 环境变量 / secrets

### `.dev.vars`（本地，已 gitignore）

```dotenv
ENVIRONMENT=development
TURNSTILE_ENABLED=false
ALLOW_TURNSTILE_FALLBACK=true
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
IP_HASH_SALT=dev-only-salt
```

### Cloudflare Worker

| 名称 | 类型 | 说明 |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | secret | Turnstile siteverify |
| `IP_HASH_SALT` | secret | IP hash 的每日 salt，不存原始 IP |
| `ENVIRONMENT` | var | `production` / `development` |
| `TURNSTILE_ENABLED` | var | 生产设 `true` |
| `ALLOW_TURNSTILE_FALLBACK` | var | Turnstile 载入失败时是否允许降级提交 |

```bash
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
pnpm exec wrangler secret put IP_HASH_SALT
```

### 前端

`VITE_TURNSTILE_SITE_KEY` 是公开的 site key，写在 `.env` 或 CI 的变量里：

```bash
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```

开发时留空也能跑；页面会显示“人机验证没有加载出来”，并使用更严格的频率限制。

## Cloudflare 初始化

```bash
pnpm exec wrangler d1 create torzo-qun-db
```

把返回的 `database_id` 写进 `wrangler.jsonc`，然后：

```bash
pnpm db:migrate:remote
```

Turnstile：在 Cloudflare Dashboard 建一个 widget，hostname 加 `guide.torzo.club`（以及 `qun.torzo.club`）。把 secret 设成 Worker secret，把 site key 设成 `VITE_TURNSTILE_SITE_KEY`。

Access：给 `guide.torzo.club/admin*` 和 `guide.torzo.club/api/admin*` 建自托管应用，策略只允许管理员邮箱。Worker 会检查 `Cf-Access-Authenticated-User-Email`；没有这层头就会返回 403。

## 构建与部署

完整的首次部署、Access/Turnstile 配置、切流、回滚和新站 D1 备份/恢复流程见 [docs/deploy.md](docs/deploy.md)。

```bash
pnpm build          # tsc + vite build + prerender
pnpm preview:worker # 用 Wrangler 在 8787 预览完整产物
pnpm deploy         # build + wrangler deploy
```

构建产物在 `dist/`：

- `index.html`、`guestbook.html`、`admin.html`、`404.html`
- `assets/`（带 hash 的 JS/CSS）
- `images/`、`torzo-manual.pdf`

`wrangler.jsonc` 里先保留 `workers_dev: true` 方便预览；确认后加 route（不改 DNS，删 route 即可回滚）：

```jsonc
"routes": [{ "pattern": "guide.torzo.club/*", "zone_name": "torzo.club" }]
```

并把 `workers_dev` 设为 `false`。`qun.torzo.club` 继续用 Cloudflare Redirect Rule 指向 guide（301）。更完整的切流步骤见 [docs/deploy.md](docs/deploy.md#7-切换线上域名)。

## 旧留言迁移

不使用 sqldump，只调用线上接口：

```bash
pnpm migrate:comments --dry-run
pnpm migrate:comments
pnpm exec wrangler d1 execute torzo-qun-db --remote --file=./data/import.sql
```

脚本会：

- 逐页读取 `https://guide.torzo.club/comment?page=n`，直到空页
- 校验并保留 id / author / article / 时间
- 生成 `data/legacy-comments.json`、`data/legacy-comments.sha256`、`data/import.sql`
- 使用 `INSERT OR IGNORE`，可重复执行

本地已验证：**67 条，id 1–79，缺 3–11、25、54、55，checksum `df848b2ea168c916aaefe2b240fc0421f57e138d8d02b7577162f8768442b073`**。缺的 12 个 id 是旧库已删除的数据，HTTP 接口取不回来。

上线上再跑一次 delta（脚本可重复执行），确认总数后再切 DNS。D1 免费版 Time Travel 7 天；切之前和切之后各做一次。新站 D1 的完整备份、校验和恢复流程见 [docs/deploy.md](docs/deploy.md#8-新站数据备份重点)：

```bash
mkdir -p data/backups
STAMP=$(date +%Y%m%d-%H%M%S)
pnpm exec wrangler d1 export torzo-qun-db \
  --remote \
  --output="./data/backups/torzo-qun-${STAMP}.sql" \
  --skip-confirmation
```

## 内容维护

章节在 `src/content/`，注册表在 `src/content/chapters.ts`。

- 新增章节：写一个返回 `ReactElement` 的组件，加进 `QUN_GUIDE_CHAPTERS`。
- 改文案：直接改 TSX 文本；改完跑 `pnpm test`。
- 失效链接用 `<del className="qun-dead-link">[失效链接]</del>`。
- 群历史数据在 `src/content/history.tsx` 的 `HISTORY_TERMS`。

## 检查

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 其他

- 旧的 `config.env` 曾把 MySQL 密码和 JWT secret 提交进公开 repo；v2 已删除该文件。旧 server 退役前请轮换数据库密码，不要再复用旧 JWT secret。
- 留言与页面内容以中文为主；页面、表单、按钮均使用简体中文。
- 代码使用 MIT License；导册内容版权由同装会保留。
