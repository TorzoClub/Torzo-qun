# TypeScript 编程方法论

> 这是编码硬规则，不是风格散文。文中"必须/不要"是硬规则，"尽量/优先"是默认选择；偏离硬规则要写 `// justify: <节号> <理由>`，并在交付说明里列出。
>
> 示例是示意，不是模板；与规则冲突时以规则为准。开工前读 [glossary.md](glossary.md)，提交前过第十二节。Agent 阅读顺序见 [AGENTS.md](../AGENTS.md)，文档索引见 [introduction.md](introduction.md)。示例里的 `Order`、`User` 是虚构的；项目术语以术语表为准。

---

## 零、开工前：先查术语表

- 先读 [glossary.md](glossary.md)；代码、API、文档、UI 一律用表里的词和大小写（`ItemID`，不是 `ItemId`）。
- 本项目的 `Item` 是系统唯一公共实体，不是"任意对象"；领域术语不得被通用工具函数占用。通用函数用 `T` / `TValue` / `entry` / `value`。
- 新增领域概念：先更新 `glossary.md`，再写代码；不要在代码里发明同义词。
- 代码/文档与术语表不一致：以术语表为准，并指出问题。

---

## 总纲：六条原则

1. **决策是树，操作是线。** 树状决策写完整 `if / else`；线性操作是顺序步骤；两者都不 early return。
2. **行为靠组合，不靠封装状态。** 用函数、闭包、对象字面量组合逻辑，不用对象持有状态再用方法操作它。
3. **上下文显式传递。** 函数需要什么就写在参数里，不依赖"我身处何处"。
4. **副作用可控，核心引用透明。** 脏事集中到边界；核心表达式尽量能被结果替换而不改变行为。
5. **能用类型消除的分支，不要用控制流表达。** 类型越精确，`if` 越少。
6. **状态只允许一个所有者。** 所有者之外只收旧值、出新值。

---

## 一、控制流：树状决策与线性操作

**原则**：决策是树，操作是线；两者都不允许 early return。

**先分清目的**：

- **树状决策**：函数要在互斥的结果/业务分支之间选择，或决定"放行还是拒绝"。必须写完整 `if / else` 树；`else if` 只用于同级互斥，跨层用 `else { if }` 或抽函数；分支用 `{}` 包裹；超过 4 层是拆函数信号。**入口处一组并列校验即使都 `throw`，也是同一层的兄弟分支**：写成 `if / else if / else`，主逻辑放最后的 `else`。
- **线性操作**：函数是一串按顺序执行的步骤。每步可以有自己的 `if (cond) { 动作 }`，不补 `else`，执行完继续下一步；条件用 boolean 谓词或局部 `const`。中途某步失败要中断流程时，用 `if (bad) { throw }`（不补 `else`），因为它不是与其它分支互斥的选择。
- **循环筛子**：过滤/查找用 `if` 或 `[].find` / `[].filter`，不补 `else`；不允许 `continue` / `break`（见第四节）。

**判断标准**：是在互斥结果里选一个（包括"放行还是拒绝"），还是依次做几件事？

- **选结果 / 判决**（如 `getStatus`、`deleteItem` 的入口校验）：完整 `if / else` 树，所有兄弟分支在同一层。
- **做步骤**（如 `linearOperation`）：直线流程，条件只决定"这一步做不做"，做完继续。

**仍然不允许 early return**：不能 `if (bad) return ...`；完整 `if / else` 分支里的 `return` 是该分支的结果，不算 early return。失败要作为正常返回值（`Result` / 联合类型）时，按树状决策/Result 写。

**单入口检查也是判决**：入口即使只有一条“放行 / 拒绝”检查，也要写成 `if (bad) { throw } else { main() }`，不能写成 `if (bad) throw; main()`。线性操作只适用于“按顺序做几步”（如 `publishPage`）；“先检查，再执行主逻辑”属于判决树。

```ts
// 树状决策：完整 if/else，两层就写两层
function getStatus(order: Order | null): Status {
  if (order === null) {
    return 'unknown'
  } else {
    if (order.status !== 'paid') {
      return 'pending'
    } else {
      return 'paid'
    }
  }
}

// 判决：入口校验是同一层的兄弟分支，主逻辑放最后的 else
function deleteItem(item: Item, db: DbLike): void {
  if (item.id <= 0) {
    throw new Error('invalid item id')
  } else if (item.unity_name?.startsWith('sys.') === true) {
    throw new Error('system item')
  } else {
    db.delete(item.id)
  }
}

// 线性操作：按顺序执行步骤；每个 if 只决定"这一步做不做"
function publishPage(page: Page, db: DbLike): void {
  if (page.has_cover) {
    renderCover(page)
  }
  const body = renderPage(page)
  const is_valid = isPageValid(page)
  if (is_valid) {
    db.update(page.id, body)
  }
  if (is_valid && page.publish_now) {
    notifySubscribers(page.id)
  }
  recordPublished(page.id)
}
```

**树状决策的层级**：`else if` 是同级互斥兄弟；跨层子问题用 `else { if }`；层深了抽命名函数（函数名就是那一层的标签）。不要用 early return 压平。若 lint 要求把嵌套 `if` 合并成 `else if`，关掉该规则。

### 1.1 多行三元：`?` / `:` 与条件平齐

三元只用于简单选值，不嵌套。多行时，`?` 和 `:` 必须和条件表达式的第一个字符对齐，不要用固定缩进，也不要让 `?` 跟在条件后面。

```ts
const node_stream = range === null
                    ? fs.createReadStream(file_path)
                    : fs.createReadStream(file_path, { start: range.start, end: range.end })
```

- 条件、`?` 分支、`:` 分支各占一行；每个分支单独一行。
- 短到一行能读清的三元可以一行；一旦多行，就按这个格式。
- 不嵌套三元；需要嵌套时改 `if / else` 或抽函数。

**JSX 例外**：JSX 条件渲染保持下面的结构，不强制拆成三行；`? (` / `) : (` 是 JSX 分支结构，不是选值三元，不要为了套 1.1 把它改成三行。

```tsx
{ctx === null ? (
  <ConnectScreen onConnected={connect} />
) : (
  <MainLayout
    route={route}
    ctx={ctx}
    refresh_key={refresh_key}
    sidebar_key={sidebar_key}
  />
)}
```

条件仍然必须是 boolean（见 1.2）。

### 1.2 条件必须是 boolean，不做隐式转换

`if` / `while` / `do...while` / 三元 / `for` 的 test 条件必须是 `boolean`；不要依赖 truthiness。`if (value)`、`if (items.length)`、`value ? ...` 都不允许；写显式比较或谓词。

```ts
// ❌ 隐式转换
if (items.length) { ... }
if (value) { ... }
const label = value ? 'x' : 'y'

// ✅ 条件本身就是 boolean
if (items.length > 0) { ... }
if (value !== null) { ... }
const label = value !== null ? 'x' : 'y'
```

- 字符串 `!== ''`；对象/可能空 `!== null`；`Map.get` `!== undefined`；长度 `> 0`；数字 `!== 0`（如果 0 是"空"）。
- `if (a && b)` 只有在 `a`、`b` 都是 boolean 时才可以；值是对象/字符串时先比较。
- 不要用 `!!value` / `Boolean(value)` 绕过；它们仍然把"什么算真"藏起来。
- `&&` / `||` 不用于控制流（条件执行、副作用）；`??` 只用于默认值。
- JSX 条件渲染的 `cond` 也必须是 boolean（1.1 只是排版例外，不是类型例外）。

---

## 二、无类，无 this，组合优于封装

**看法**：`class` 把状态和操作绑在一起，用 `this` 隐式串起来，带来隐式上下文、继承耦合和可变状态。从内聚/耦合看，`class` 看似把状态和方法放在一起，实际把每个方法和每个字段都耦合起来；组合把"一份状态 + 它的转换"收在一个小的所有者里（高内聚），其他模块只依赖不可变值和少量操作（低耦合）。

**唯一例外**：继承 `Error` 定义错误类型；`this.name` 属于特批，不视为面向对象设计。

**因此**：

- 不写 `class`（错误类型除外），不写 `this`。需要带状态的对象用闭包工厂；需要一组方法用返回对象字面量的工厂；需要串联处理用 `Pipe` / `Compose`。
- 需要复用用组合，不继承；消费第三方 class 可以用 `new` / `instanceof`，禁的是自己写。
- 存量 class 只在与本次改动直接相关时迁移，不做全仓重构。

```ts
function CreateCounter() {
  let $_count = 0
  return {
    increment: () => { $_count += 1 },
    get: () => $_count,
  }
}
```

### 2.1 偏应用 / 柯里化：白名单

这里管的是**把偏应用/柯里化抽成可复用的函数或工厂**；调用点就地写的内联箭头（`items.filter(item => item.active)`）不在此列。

偏应用是固定一部分参数、得到新函数；柯里化是把多参函数变成一层层单参函数。**默认不用；只有下面五种情况可以用**：

| 情况 | 用法 |
|---|---|
| 依赖预绑定（入口/适配器） | 绑定 `db` / `now` / `logger` / `config`，得到只接收业务数据的函数 |
| 回调适配（局部） | `items.sort(CreateComparator('name'))`；只在该调用点用，不导出通用 API |
| 管线步骤 | `Pipe(normalize, ValidateWith(schema), SaveTo(db))`；3–5 步、每步一元 |
| 通用工具工厂 | `CreateDebounce(delay)`、`CreateLogger(level)`、`CreateRateLimiter(limit)` |
| 测试/测试数据 | 测试里绑定假依赖，构造输入；只限测试代码 |

白名单之外默认不做：不要固定业务数据（`order_id` / `user` / `amount`）；不要三层以上柯里化；不要为了"看起来函数式"写一串括号；不要在模块顶层预绑定并导出；不要用偏应用代替工厂/对象参数；只有一个调用点不要抽；不要固定可变依赖。

**判断标准**：被固定的必须是稳定的依赖/配置，剩下的必须是业务数据；调用点应该更简单、更清楚。返回函数的工厂按 5.3 用 PascalCase（`CreateLogger`、`CreateComparator`）；内联适配直接用箭头，不要专门命名。

### 2.2 不走重度函数式：实用主义

借用函数式的手段——纯函数、组合、不可变、`Result` 联合类型——但不引入整套类型级抽象。业务代码首先要让普通 TS 读者读懂。

- 不引入 `ts-effect`、`fp-ts`、Effect、IO monad、do notation、monad transformer、free monad。
- 错误用 `throw` / `Result`，不需要每个函数都变成 `Either` / `Effect`；`Result` 可以有小型 helper，但不要做成 monad 体系。
- 状态用单一所有者的闭包/对象，不用 State monad / STM；依赖用参数/回调，不用 Reader monad / Effect layer；异步用 `async` / `await` + `Promise.all`，不用 Task/Effect。
- 允许的轻量函数式：`map` / `filter` / `reduce`、`Pipe`、`Result`、`ts-pattern`、可辨识联合 + `switch` + `unreachable`、纯函数。
- 判断标准：如果一个抽象需要读者先学一套类型级概念才能读懂业务，就不引入。引用透明是纯函数 + 不变性的结果，不是 monad/effect。

### 2.3 不用 getter/setter，也不用 Proxy

`obj.name` 看起来是读数据，但 getter 可能在背后计算、抛错、改状态、返回新对象；`Proxy` 连属性存在、赋值、删除都能拦截。两者都把"实际发生了什么"藏到属性访问后面。

- 不写 `get name() {}` / `set name(v) {}`，也不写 `Object.defineProperty(obj, 'name', { get, set })`；属性访问只读数据。
- 不用 `Proxy`；需要拦截/反应式/懒加载，用显式函数、`Signal` / `Memo`（见 8.2）、普通回调或 `Map`。
- 计算值用纯函数 `fullName(user)`；修改值用所有者的显式操作 `updateName(user, name)`；校验用 `parseX` / `checkX`，不要藏进 setter。
- 消费第三方对象上的 getter / Proxy 不算；只约束自己写的代码。
- 确实必须用 Proxy（目前没遇到）时，先讨论并写 `// justify: 2.3 <理由>`；不要默认用。

---

## 三、副作用：集中，可控，而不是消除

副作用不可能消除；问题不是"有副作用"，而是**副作用散落各处、互相干扰**。把 I/O、网络、日志、随机、时间、状态变更收拢到少数明确的点；中间的纯计算保持干净。

**引用透明性**：一个表达式如果可以被它的求值结果替换，而不改变程序行为，它就是引用透明的。对函数来说：同样的输入总是同样的输出；不读/不改隐藏的可变状态，不依赖时间、随机、I/O、全局变量。

**判据**：能不能把 `f(x)` 抽出来、提前/延后求值、换成它的返回值，而不改变行为？不能，就不是引用透明。

- ✅ `add(1, 2)`、`price * quantity`、`formatName(user)`（纯函数 + 不可变入参）
- ❌ `Date.now()`、`Math.random()`、`counter++`、`readFile()`、`getUser()` 读可变 DB、修改入参的函数

纯函数 + 不可变数据是最常见的组合，但引用透明比"纯"更贴近使用：它问的是"这个表达式能不能被结果替换"。副作用不是消失，而是被推到边界；核心保持引用透明，边界集中处理脏事。

**因此**：

- 数据默认不可变：修改 = 创建新对象/新数组，不原地改；函数不修改入参。
- 有副作用（I/O / 网络 / 日志 / 时间 / 随机 / 状态变更）或 mutation 的函数，返回值只能是 `void`（`Promise<void>`）或 `Result<T, E>`；不要返回裸数据、布尔、数组长度。纯查询（无副作用）可以返回数据；可能失败的查询用 `Result`。
- 领域写函数（repo / service）返回 `void` / `Result`；HTTP / RPC / CLI / 存储适配器等边界可以把 `Result` 失败映射回 `AppError` / `Response` / wire data。边界函数本身可以返回 transport data，但不要把 `Response` 带进业务层。
- 项目内领域写函数用 `writeRun` 包装，成功返回 data，失败返回 `WriteFailure`；边界用 `unwrapWrite` 映射回 `AppError`。`WriteFailure` 可带内部诊断 `cause`；cause 只用于日志/诊断，不参与业务分支，不序列化到 HTTP/wire；边界转 `AppError` 时透传。
- 数组禁止原地改：不用 `push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse` / `fill` / `copyWithin`。要变就 `let $arr`，然后 `$arr = [...$arr, x]` / `$arr = $arr.slice(0, 3)`；只有性能瓶颈（有测量依据）才用原地方法，并写 `// justify: 3 <理由>`。
- 纯函数是默认形态；中间计算保持纯净，脏事在明确的位置一次做完。
- 副作用集中到可数的点：要么一个函数统一做，要么在流程的固定阶段统一处理。
- 引用透明被破坏时，把时间/随机/I/O/可变全局移到边界或参数注入，不要让它藏在核心函数里。

### 3.1 单一所有者

**定义**：状态的值可以传给任何需要读的人；"所有者"不是"持有这个值的人"，而是**唯一有权把这份状态换成新版本的地方**——通常是一个闭包或一个模块。一个"状态源"（一个 `let`、一个对象或 `Map`）只有一个这样的地方；从它算出来的值不算新的状态源。

**因此**：

- 一份状态源只有一个所有者；不是整个应用共用一个，而是每份状态各自有主人。
- 状态跟着所有者一起出现、一起消失；数据库是持久化的地方，内存里的是副本。
- 需要跨模块订阅一个值的变更时，用 `vait` 的 `Memo` / `ChangedSignal`（见 8.2），并在订阅者销毁时调用返回的 `off`；普通状态仍然用闭包变量，不要把所有状态都换成 Memo。
- 所有者管"状态怎么换"，不管"业务怎么做"；业务逻辑放纯函数，所有者只应用转换、替换引用。对外可以有多个操作，但最后都走同一个修改入口；没人能绕过所有者改。
- 私有但有两个内部写点，仍然是两个写点；"只有一份数据"和"只有一处能改"是两件事。
- `get` 传出去的值必须不可变；`readonly` 只是编译期，`Object.freeze` 只是浅层；要深度不可变或结构共享。否则调用方一改，引用透明就破了。
- 修改 = 用纯函数算出下一状态，再一次性替换引用；不原地改，不改入参；失败时旧状态不动。
- 直接替换整个状态的 `set` 只在所有者内部用；对外操作要守住规则。
- 异步修改要排队（同步替换，或队列/锁）；两个 `await` 交错着改，等于没有单一所有者。
- 状态放在真正需要共享它的那一层：只有子树用就放子树，只有全局用才放入口；不要为了省事把局部状态提升成全局。
- 局部 `let` 只是累加器/游标，函数自己就是所有者；不导出可变绑定，不搞模块级可变单例。
- 从状态算出来的值不要另存一份；缓存由所有者负责失效。

```ts
// State 是深度不可变的值；get 返回它，调用方不能改
function CreateStateCell<State>(initial: State) {
  let $_state = initial                 // 唯一所有者
  return {
    get: () => $_state,
    update: (next: State) => { $_state = next },   // 低层 set；对外用领域操作
  }
}
```

---

## 四、循环：结构化控制，不靠跳转

`continue` 和 `break` 是控制流的 goto；它们让读者在循环里寻找"哪里跳出去了"。

| 看到 | 写成 |
|---|---|
| 跳过某些元素 | 用 `if` 包裹，条件成立才执行 |
| 找到就退出 | 把循环封进函数，用 `return` 结束查找；或直接 `find` |
| 从集合选/造 | `map` / `filter` / `find` / `some` / `every` |
| 有副作用的顺序执行 | `for...of`，内部保持树的形状 |

- 不用 `continue`；把"跳过"改写成 `if` 包裹。
- 不用 `break`；把查找封进函数，`return` 是查找结果的终点。`if (xx) { return ... }` 只能在"函数的目的就是查找/扫描，且循环结束即返回"时使用；它的另一半是"继续扫描"，不是被剪掉的分支。
- `map` / `filter` 就是控制反转的标准形态（见 7.1）。

```ts
function findNumber(list: number[], target_num: number): null | number {
  return list.find((current) => current === target_num) ?? null
}
```

---

## 五、命名即意图

名字是读者对代码的第一份契约。名字要回答"这是什么角色、在哪个范围、能不能改"。

### 5.1 函数 vs 数据

- 函数表达动作/能力：**camelCase**，`fetchUser`、`calcOrderTotal`。
- 数据表达值：**snake_case**，`user_name`、`retry_count`。
- 通用工具函数（在 `utils/`，不引用领域类型或完全泛型化）可以用 `findList`、`target_num` 这类描述性命名；业务代码仍禁止占位符和类型后缀。

### 5.2 导出名带模块名，非导出名省略

- 导出的函数/变量带模块/领域名：`galleryInEvent`、`galleryCanSubmit`、`galleryMemberIsVoted`。
- 非导出省略模块名：`inEvent`、`canSubmit`、`memberIsVoted`。
- 名字本身已含领域名（`fetchUser`、`parseUserId`、`CreateUserApi`）就不重复加前缀；规则是"不能省掉领域名"，不是"必须多一个前缀"。
- 导出的数据值/全局常量用 `MODULE_VAR_NAME`（`GALLERY_MAX_PHOTOS`）；非导出全局常量省略模块前缀（`MAX_PHOTOS`）。不再用两端的 `__`。
- **模块 API 对象**（带方法/行为、被其他模块作为接口使用的对象）保留稳定接口名：Drizzle table（`items` / `blobs`）、zod schema（`zItem` / `zGallery`）、React module descriptor（`__PAGE_MODULE__` 等）。它们不套纯数据命名；纯数据对象仍按 5.4。
- 工厂 `CreateGalleryStore`，不要只写 `CreateStore`（除非是 `utils/` 通用工具）。
- `as<T>` / `Is<T>` 是通用工具（像 `Pipe`），不加模块前缀；放在 `packages/types`。
- ❌ 导出的 `voteCountByPhoto` / `memberHasVoted` / `memberHasSubmitted`：应带 `gallery`。

### 5.3 返回可调用物/方法集合的函数 → PascalCase

函数如果产出可调用对象（返回函数、方法集合、能力元组如 `[get, set]`），本质是工厂/构造器，用 PascalCase 让调用处看出"拿到的是能力，不是结果"。

```ts
function CreateCounter() { /* 返回对象/可调用物 */ }

function CreateUserApi(_base_url: string) {
  return {
    userUrl: (id: UserId) => `${_base_url}/users/${id}`,
    usersUrl: () => `${_base_url}/users`,
  }
}

function Pipe(...fns) { /* 返回函数 */ }
```

判断标准是产物，不是声明形式：用 `const` 声明的可调用物，仍按函数命名。

### 5.4 作用域与可变性写进名字

> **口诀**：`foo_bar` 不可变；`_` 前缀表示跨作用域；`$` 前缀表示可变；`$_` 前缀表示既是可变又是跨作用域。

| 形态 | 命名 | 例 |
|---|---|---|
| 全局/模块级常量（不可变） | `FOO_BAR`（导出带模块/领域名） | `GALLERY_MAX_PHOTOS`、非导出 `MAX_PHOTOS` |
| 本地 const / 未跨作用域只读参数 | `foo_bar` | `base_url`、`user_id` |
| 本地可变值 | `$foo_bar` | `$retry_count` |
| 跨作用域、不可变 | `_foo_bar` | `_db`、`_config` |
| 跨作用域且可变 | `$_foo_bar` | `$_count`、`$_state` |

- "可变"包括重新赋值和内容变更；内容会变的共享容器用 `$_foo_bar`，只读共享依赖用 `_foo_bar`。
- `const` 表示绑定不重新赋值；`let` 表示会重新赋值。纯数据要变就整体替换（新对象/新数组），不通过修改 `const` 对象的字段来省 `let`；可变值用 `let $foo_bar`。
- 形参默认不可变：`function renderBlock(base_url: string) { ... }`；被闭包捕获（跨作用域）写 `_base_url`。确实需要重新赋值/改内容时写 `$base_url`（优先改成局部变量），两者都成立写 `$_base_url`；不要修改入参对象。

```ts
function createLabeler(_prefix: string) {
  return (name: string) => `${_prefix}${name}`
}

function countDown(start: number): void {
  let $remain = start
  $remain -= 1
  render($remain)
}
```

- 自有 React 组件的 props 属性名用 `foo_bar`（`refresh_key`、`base_url`）；第三方组件的 props 沿用其库约定，不改写。
- `useState` / `useMemo` 的值一律写 `foo_bar`，不加 `_`：它们在当前渲染帧内固定不可变，跨渲染帧由 React 换新值，不是闭包捕获的可变状态。setter 按 React 约定写 `setFooBar`。
- `useCallback` 返回函数值，按 camelCase `foo_bar`；它与 `useState` / `useMemo` 一样是渲染帧内的稳定值，不加 `$` / `_`。
- `useRef` 得到的 ref 对象写 `$foo_bar`：对象本身不换，但 `.current` 会跨渲染帧变化，按可变值处理。

```tsx
const [foo_bar, setFooBar] = useState('')
const sorted_items = useMemo(() => sortItems(items), [items])
const formatUsers = useCallback((users: User[]) => users.map(formatUser), [])
const $input_ref = useRef<HTMLInputElement | null>(null)
```

- 全局常量用 UPPER_SNAKE，不加前缀；导出的带模块/领域名，非导出的省略模块前缀。不导出可变绑定。

### 5.5 其他

- 布尔值带 `is` / `has` / `can` / `should` 前缀；状态/角色用 `is`，拥有/包含用 `has`。
- 禁止 `data`、`temp`、`obj`、`flag` 这类占位符；变量名不带类型信息（`user_list` → `users`）。
- 类型/接口用 PascalCase；泛型用 `T` / `TValue` / `TResult`，不要用撞领域术语的 `TItem`。
- 品牌符号（`declare const UserIdBrand: unique symbol`）用 PascalCase，不走全局常量的 `MODULE_VAR_NAME`。

### 5.6 命名决策表

| 东西 | 形态 | 命名 | 例 |
|---|---|---|---|
| 导出的数据值 | 不可调用 | `MODULE_VAR_NAME` | `GALLERY_MAX_PHOTOS` |
| 模块 API 对象 | 带方法/接口的稳定对象 | 保留稳定接口名 | `items` / `zItem` / `__PAGE_MODULE__` |
| 导出的函数，返回数据 | 动作 | `moduleAction` | `galleryInEvent` |
| 导出的工厂，返回可调用物/能力集合 | 能力 | `CreateModuleX` | `CreateGalleryStore` |
| 非导出函数/数据 | 函数/数据 | 省略模块名 | `inEvent` / `max_photos` |
| React 组件 | 框架约定 | PascalCase | `GalleryCard` |
| React props（自有组件） | 属性值 | `foo_bar` | `refresh_key`、`base_url` |
| `useState` / `useMemo` 值 | 渲染帧内不可变 | `foo_bar`（不加 `_`） | `foo_bar`、`sorted_items` |
| `useCallback` 返回值 | 函数值 | `foo_bar` | `formatUsers` |
| `useRef` 对象 | 内容可变的稳定容器 | `$name` | `$input_ref`、`$timer_ref` |
| Hook | 框架约定 | `useX` | `useGalleryVotes` |
| 类型/接口 | 类型层 | PascalCase | `UserId` |
| 品牌符号 | 类型层 | PascalCase | `UserIdBrand` |
| 通用工具函数 | 无领域类型或全泛型、在 `utils/` | 描述性，可用类型后缀 | `findList`、`target_num` |
| 本地可变值 | 会变、不跨作用域 | `$name` | `$retry_count` |
| 跨作用域只读 | 跨作用域、不变 | `_name` | `_db`、`_config` |
| 跨作用域且可变 | 会变、跨作用域 | `$_name` | `$_count`、`$_loaded_data` |
| 布尔 | 判断 | `is` / `has` / `can` / `should` | `is_voted`、`has_children` |
| 内部哨兵 | 不导出 | `NONE` | `const NONE = Symbol('NONE')` |

### 5.7 校验工具：zod 优先，`parse` / `check` / `is` / `as` / `to` 兜底

外部输入先过 zod（见 6.4）；zod 能表达的约束就写在 schema 里，不要另建一套手写校验。选择次序：

1. **zod schema**：用 `.refine` 表达跨字段/业务不变量，`.transform` 做归一化/转换，`.brand` 标记品牌；这三者能覆盖的，不再写 `parseX` / `checkX` / `isX`。
2. **复用已有 schema**：用 `.extend` / `.pick` / `.merge` 组合，或把已有的 `isX` 谓词交给 `.refine(isX)`，不要复制同一组规则。
3. **手写工具**：只有 zod 表达不了时才用——需要 DB/上下文、跨 Item 查询、热路径性能敏感，或内部可信数据的领域不变量。
4. **`as<T>` / `Is<T>`**：`as<T>` 只用于测试/fixture/已校验边界；`Is<T>` 只用于把 boolean 检查构造成类型谓词。

**已有实现，直接 import，不要重写**：

| 工具 | 来源 | 用法 |
|---|---|---|
| `as<T>` | [`packages/types/src/as.ts`](../packages/types/src/as.ts) | `import { as } from '@laibrary/types'` |
| `Is<T>` | [`packages/types/src/is.ts`](../packages/types/src/is.ts) | `import { Is } from '@laibrary/types'` |

- `parseX`：把已过 zod（或内部可信）的 raw 转成合法的 X；返回值一定满足 `checkX` 的约束，但 parse 内部不调用 `checkX`；失败抛解析错误。
- `checkX`：多项运行时校验，失败抛领域错误；可返回收窄后的类型。用于 zod 之后的领域不变量、内部可信数据，或测试 parse 契约；内部用具体守卫 + `!guard()` 判断，最后统一抛一次。
- `is<Domain>`：类型谓词 `value is X`，不是普通 boolean；必须做真实运行时检查。具体写 `isGallery` / `isBlob`，不写对所有类型通用的守卫；用于内部/可信数据或 zod 之后的领域谓词。

```ts
function isBlobID(value: unknown): value is BlobID {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value)
}

// 现有实现：packages/types/src/is.ts；业务代码从 @laibrary/types 导入
export function Is<T>(check: (value: unknown) => boolean): (value: unknown) => value is T {
  return (value): value is T => check(value)
}
```

```ts
const isGallery = Is<Gallery>(value =>
  typeof value === 'object' && value !== null && 'id' in value && 'name' in value,
)

if (isGallery(maybe_gallery)) {
  // maybe_gallery 收窄为 Gallery
}
```

`T` 必须显式给：`Is(...)` 会得到 `(v: unknown) => v is unknown`。否定一律 `!isGallery(value)`；不定义否定版守卫。

- `as<T>`：唯一的无校验断言，不再写 `asGallery` / `asBlob`。用 `AsInput<T>` 约束输入类别：

```ts
// 现有实现：packages/types/src/as.ts；业务代码从 @laibrary/types 导入
export type AsInput<T> =
  [T] extends [number] ? number :
  [T] extends [string] ? string :
  [T] extends [boolean] ? boolean :
  [T] extends [bigint] ? bigint :
  [T] extends [symbol] ? symbol :
  [T] extends [object] ? object :
  never

export function as<T>(value: AsInput<T>): T {
  return value as T
}
```

- `as` 的入参不是 `unknown`；raw 先走 zod / parse / check / 守卫，收窄到 object/number/string 等类别后再 `as`。`as<Gallery>(raw_unknown)` 会编译失败。
- `as` 只挡类别/空值，不校验形状、字面量、品牌业务约束；`as<Gallery>({})` 也能过。它不是 parse/check；只用于测试/fixture、或 zod/check 之后的边界。

| 调用 | 结果 |
|---|---|
| `as<GalleryID>(123)` | ✅ |
| `as<GalleryID>(undefined)` / `null` / `'x'` | ❌ 编译错误 |
| `as<BlobID>('a'.repeat(64))` / `as<BlobID>(123)` | ✅ / ❌ |
| `as<Gallery>({ id, name })` / `as<Gallery>(123)` | ✅ / ❌ |
| `as<Gallery>({})` | ✅ 但不校验形状 |
| `as<Gallery \| null>(null)` | ❌；先显式处理 null |

- `toX`：域内转换，输入已经是领域类型；纯函数、总函数，不做校验、不接收 `unknown`。
- 名字必须诚实：转换叫 `parse`，抛错校验叫 `check`，具体类型谓词叫 `isGallery` / `isBlob`，高阶构造器叫 `Is`，否定写 `!isGallery()`，不校验的断言叫 `as`。

---

## 六、类型：把约束写进语言

类型是编译期契约，用来消除可能性，不是绕过可能性。

- 不用 `any`，用 `unknown` + 收窄；不用 `!`，用显式判空；不滥用 `as`，优先类型守卫与可辨识联合。
- 导出 API 显式标注返回类型；用联合字面量代替 `enum`；公共数据结构用 `readonly`。

### 6.1 空值：默认 `null`，内部用 `NONE`

- 默认 `null`；`undefined` 只留给语言强加的位置——可选属性、`Map.get`、数组越界、第三方返回值。跨出边界时归一：`map.get(key) ?? null`。
- 可选属性只表达"键可能缺席"：`{ cover?: string }` 和 `{ cover: string | null }` 不要混。
- 需要区分"未设置"和"设为空"、且绝不参与序列化的内部状态，用模块内的 `NONE = Symbol('NONE')`；只导出类型和 `isNone()`，不导出符号本身。`NONE` 不参与 JSON；跨网络/存盘换成 `null` 或 `Result`。

### 6.2 品牌类型：让"长得一样"的值不可互换

`UserId` / `OrderId` 在运行时都是 `string`，编译器也认为相同；把订单 ID 传给"查用户"会编译通过、运行时出错。用品牌类型区分语义不同、结构相同的值。

```ts
declare const UserIdBrand: unique symbol
type UserId = string & { readonly [UserIdBrand]: 'UserId' }

function isUserId(raw: unknown): raw is UserId {
  return typeof raw === 'string' && raw.startsWith('u-')
}
```

- 外部 raw 先过 zod（见 6.4）；`isUserId` / `parseUserId` / `checkUserId` 是 zod 之后的领域守卫/转换，不是外部形状入口。
- 品牌优先在 schema 里标记：新品牌用 `z.string().startsWith('u-').brand<'UserId'>()`，类型由 `z.infer` 产出；已有 `unique symbol` 品牌（如 `BlobID`）用 `.transform(as<BlobID>)` 接入，不要为同一个概念再造一套不兼容的品牌。
- 品牌只用在领域身份重要、容易被混淆的地方（id 是典型），不要给所有原始类型套品牌。

### 6.3 让非法状态不可表示

一堆可选字段会把"哪些组合合法"交给读者；用可辨识联合把非法组合从类型里去掉。

```ts
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'error'; error: Error }
```

新增分支时用 `unreachable(value: never)` 提醒漏了哪一支。可选属性只表达"键可能缺席"；"值可能没有"用 `null`。

### 6.4 边界解析：外部输入先过 zod

外部数据（HTTP body/query/params、JSON、env、文件、第三方 API）运行时是 `unknown`。静态类型只是编译期契约，不会让数据变对；`as` 只是让编译器闭嘴。外部输入必须先过 zod，zod 的输出才是可信的静态类型。

```ts
import { z } from 'zod'

const zGallery = z.object({
  id: z.string(),
  name: z.string(),
})

type Gallery = z.infer<typeof zGallery>

const gallery = zGallery.parse(raw) // raw: unknown
```

- `zGallery` 是 zod schema（模块 API 对象），保持稳定名；纯数据对象才按 5.4。

- 类型由 `z.infer` 产出，不手写 interface 再 `as`。
- 能 `.refine`（跨字段/业务不变量）、`.transform`（归一化/转换）、`.brand`（品牌）表达的约束都放进 schema，不要另写一套 `parseX` / `checkX` / `isX`。
- 复用已有 schema/谓词：`.extend` / `.pick` / `.merge` 组合，或 `.refine(isX)` 接已有守卫；不要复制同一组规则。
- `parse` 用于边界抛错；`safeParse` 用于可预期失败，返回 Result，不吞掉。
- zod 之后的值才进入业务；内部函数信任静态类型，不再重复判空。
- 不要把 `as`、手写 `parseX`、手写具体守卫当作外部形状入口；它们没有运行时证据。`parseX` / `checkX` 只做 zod 之后的领域不变量/转换，或内部可信数据。
- 静态类型只在**可信、可控**时信任：
  - 信任：zod 输出、内部函数参数/返回值、常量、测试 fixture、自己代码造出来的值。
  - 不信任：`JSON.parse`、`request.body` / `query` / `params`、`process.env`、`fetch` / 第三方响应、文件内容、`localStorage`、URL 参数；DB row 除非由 schema/迁移保证，否则也按边界数据对待。
- 不用 `as` 穿过外部边界；不用 `!` / `any`。
- zod schema 放边界模块；一个外部形状一个 schema，别在每个函数里重复 parse。
- zod 失败按 §9 走：边界抛错由兜底/HTTP 映射，或 `safeParse` 转 Result；不要吞掉。

### 6.5 `readonly` / `as const` / `satisfies`

- 公共数据结构用 `readonly`，装配完成后用 `Object.freeze` 兜住运行时（见 3.1）。
- `as const` 用于字面量表，让类型收窄到字面量。
- `satisfies` 用于检查形状但不拓宽类型（`const config = {...} satisfies RetryConfig`）。

### 6.6 模式匹配：用 `ts-pattern`

- 3 个以上分支，或需要按对象形状/嵌套字段匹配时，用 `ts-pattern` 的 `match(...).with(...).exhaustive()`。
- 2 个分支（如 `Result` 的 ok/error）直接用 `if (result.ok) { ... } else { ... }`；不要为了用库而用库。
- 简单 `switch` + `unreachable` 也可以；`ts-pattern` 在嵌套/多字段/守卫时更清楚。
- 它是轻量模式匹配工具，不是重度函数式；不要用 `ts-pattern` 包裹所有 `if`，热路径用普通控制流。

```ts
import { match } from 'ts-pattern'

const view = match(state)
  .with({ status: 'loading' }, () => 'loading')
  .with({ status: 'ok' }, ({ data }) => render(data))
  .with({ status: 'error' }, ({ error }) => error.message)
  .exhaustive()
```

参考：[ts-pattern 文档](https://github.com/gvergnaud/ts-pattern)。

---

## 七、函数设计

- 位置参数不用 `?`；`f(x?: T)` 让"没传"和"传了 `undefined`"不可区分。默认值只在"缺省"是真实 API 模式时用，并写成具名常量；对象参数里的可选属性用于 partial update、props、配置，参数本身仍必传。
- 参数过多用对象参数；不用布尔参数（`render(true)` 是语义黑洞）；错误构造器的 `options?: ErrorOptions` 是唯一例外。
- 不修改入参；用组合构建逻辑（纯函数 + `Pipe`），不写大函数套大判断。
- 箭头函数用于匿名/作为值：`map` / `filter` 回调、`Pipe` 内联步骤、React 事件、短小纯转换。具名函数优先考虑 `function xxx() {}`：模块级/导出、React 组件、需要重载/泛型声明/提升/互相递归、多行逻辑；不要用 `const foo = () => {}` 只给具名函数套壳。
- 控制流遵循第一节：树状决策完整 `if/else`；线性操作是顺序步骤、不补 `else`；两者都不 early return。
- 单一职责：一个函数做一件事；行数是信号不是门槛，判断标准是可读性、重要性、必要性。
- 导出函数/方法显式标注返回类型（与第六节呼应）。

### 7.1 控制反转：需要时把选择权交出去

`map` / `filter` 是标准控制反转：遍历由它们负责，"对每个元素做什么"由调用方通过回调决定。函数不替调用方做选择，只负责流程。

- 需要外部决定的行为，用回调参数传进来：`now: () => number`、`save: (order) => Promise<void>`、`onError: (err) => void`、`compare: (a, b) => number`。
- 只是换一个值（页大小、阈值、超时），传值；换的是"怎么做"（读哪里、失败后怎么办、下一步），才传回调。
- 应用级依赖（时钟、随机、数据库、日志）在入口注入（见第八节），函数内部只通过参数接收。
- 偏应用/柯里化是控制反转的工具之一，但只有 2.1 白名单里的情况才用。
- 单一所有者里，"状态怎么换"可以由外部传入的纯函数决定（如 `(state, action) => next_state`）；所有者只提供 `get` / `apply` 的机制。

不要过度设计：只有一种合理行为、没有第二个调用方/场景时不要加回调；回调只是转发已知实现时不要抽；不要做 10 个回调参数的配置对象；常见路径保持简单；回调由谁提供、调用几次、出错怎么办要写清楚，不要用回调藏状态。

---

## 八、模块与边界

- 一个文件一个主要职责；大文件是拆分信号。行数是信号，不是门槛。
- 类型导入用 `import type`，让类型和值在导入层分清。
- 模块顶层不跑副作用：不在 import 时读配置、连数据库、注册全局 handler。
- **组合根**：配置读取、依赖创建、副作用装配只在入口做一次；其余模块只导出纯函数/工厂，依赖从参数进来（控制反转的应用层用法，见 7.1）。
- 不导出可变绑定；不搞模块级单例；配置只在入口读，不散落在各模块。
- 内部引用直指源文件，对外才用 barrel（`index.ts`）收口；避免循环依赖，发现循环先拆模块，不靠延迟 `import` 绕过。

### 8.1 常量：统一位置，命名导出

- 导出的常量统一放 `constants.ts`（每个包/领域一个；不要把所有包堆进一个全局文件）。
- 用命名导出，不要 `export default { ... }`；例如 `GALLERY_VIEWPORT_MAX_WIDTH`、`BASE_PG_RETRY_COUNT`。

- 如果常量在某个 module 里计算出来，`constants.ts` 用 re-export 收口；调用方只从 `constants.ts` 取：

```ts
export { MODULE_CALCULATED } from './module'
```

- 计算必须纯、便宜；依赖运行期配置/时间/随机的值不是常量，走组合根。
- 被 re-export 的模块不要反向 import `constants`，否则形成循环；原始常量下沉到更底层（如 `base-constants.ts`）。
- 名字按 5.2 的 `MODULE_VAR_NAME`；`FOO` 只适合演示/真正全局常量。文件内常量留在本地；对象/数组用 `as const`（必要时 `Object.freeze`），不导出可变对象。运行期配置不是常量。

### 8.2 事件与订阅：用 `vait` 的 `Signal()`

跨模块通知不要用字符串事件名 `emit('order.created')`——字符串没有类型，改名/改 payload 编译器不会提醒。用 `vait` 的 `Signal<P>()` 定义事件，订阅走 `signals.sig_name.receive(...)`，类型由事件表保证。

- 事件表：每个 `sig_*` 对应一个 `Signal<Payload>`；无 payload 用 `Signal()`（即 `Signal<void>`）。
- 订阅：`const off = signals.sig_order_created.receive((order_id) => { ... })`；`off()` 取消订阅。
- 发布：`signals.sig_order_created.trigger(order_id)`；不要 `emit('order.created', ...)`。
- 事件名就是属性名，`sig_` 前缀；改名/改 payload 由类型检查兜底。
- 事件用于通知，不用于请求/响应：需要返回值/可能失败，用函数 + `Result`（见 9.5），不要用事件回传。
- **订阅必须及时卸载**：`receive` 返回的 `off()` 要在组件卸载/模块销毁/任务结束时调用；否则 handler 和其捕获对象会被 signal 一直引用，造成内存泄漏。不要重复订阅不取消。
- 订阅回调里的错误按 §9 处理；不要静默消失。
- 如果 `signals` 要跨模块导出，按 5.2 带模块名（如 `ORDER_SIGNALS`）。

```ts
const off = signals.sig_order_created.receive((order_id) => { ... })
signals.sig_order_created.trigger(order_id)
off() // 组件卸载 / 任务结束时必须调用
```

**Memo 的订阅**：`Memo` 是带订阅的状态容器，`Memo.watch(memo, fn)` 订阅变更；`ChangedSignal(memo)` 把变更转成 Signal。**两者的订阅都必须卸载**：`Memo.watch` 返回的 `off`、`ChangedSignal` 的 subscribe 返回的 `off`，都要在订阅者销毁时调用；否则 memo 会一直持有 watcher，watcher 捕获的对象无法回收。`Memo` 比闭包变量重：能用闭包变量 + 显式回调解决，就不要上 `Memo`；只有确实需要跨模块订阅一个值的变更时才用。

参考：vait 没有正式文档；[Signal 源码](https://github.com/TorzoClub/vait/blob/master/src/signal.ts)、[Memo 源码](https://github.com/TorzoClub/vait/blob/master/src/memo.ts)。

---

## 九、异步与错误：catch 必须负责，兜底统一，保留 cause

### 9.1 异常到了这一层，只有三种选择

这一节讲 `throw` / `try-catch` 通道；`Result` 是另一条，见 9.5。

catch 不是"我接住了"的证明，而是"我决定对这条错误负责"的声明。只有三种选择：

1. **包装后继续抛**：加上本层独有的信息（路径、id、阶段），`throw new Error(msg, { cause: err })`；包装必须带来新信息，每个 catch 块最多一次。
2. **判别后在本层处理**：确认"这是什么错误"，只对能处理的那一类做真实补救——重试、换源；处理不了的照旧抛。
3. **交给调用方**：不 catch，让异常继续冒泡；或者转成 `Result` 显式返回，逼调用方分支。

**禁止第四种：无条件吞掉。** `catch { return null }`、`catch { return [] }`、空 catch 都是；它让"出事了"和"没有"变成同一个结果。判据：失败是被真正解决了，还是只是被藏起来了？

错误必须可判别：不要靠 `err.message.includes('timeout')` 猜类型；领域错误带稳定的 `code`（联合字面量），或用专用类 + 类型守卫。`code` 是契约，改动等同破坏 API；判别时穷尽已知情况，未知的用 `else` 兜底并原样上抛。

### 9.2 必须有兜底

顶层（进程/框架/入口）必须有统一兜底：Node 的 `unhandledRejection` / `uncaughtException`、浏览器的 `onerror` / `unhandledrejection`、框架 error boundary / 中间件。兜底负责记录、上报、给出可读的最终状态；它是整条链上**唯一**记录"未被处理错误"的地方——中间层不要 log 完再抛，同一件事只记一次。

### 9.3 传递错误必须保留 cause

任何在 catch 后抛出**新错误**的地方，都要用 `{ cause }` 保留原始错误链：

```ts
try {
  await loadConfig(path)
} catch (err: unknown) {
  throw new Error(`failed to load config: ${path}`, { cause: err })
}
```

自定义错误类也必须支持 cause（构造函数透传 `options?: ErrorOptions`）。兜底处遍历 cause 链打印，而不是只打 `message`；并发多错误用 `AggregateError`，每个子错误各自保留 cause。

### 9.4 其他异步与错误约定

- 悬浮 Promise 是 bug：不 `await` 就 `void` 或 `.catch()`。
- 只抛 `Error` 子类，不抛字符串/裸对象；`catch` 到的按 `unknown` 处理，收窄后再用；catch 里同样遵循树形 `if {} else {}`，不早返回。
- 独立异步任务用 `Promise.all`，不要在循环里 `await`；需要全部结果（包括失败）用 `Promise.allSettled`。
- 超时/取消用 `AbortSignal`，不要把超时塞进业务判断；流式处理用 `for await`。

**Result 形态**：可预期的**业务**失败用 Result；异常留给意外。Result 的 `E` 是失败数据，不是 `Error` 子类。

```ts
type Result<T, E> =
  | { readonly ok: true, readonly data: T }
  | { readonly ok: false, readonly error: E }
```

- 业务规则拒绝、找不到、余额不足 → Result。
- 边界解析/校验（`parseX` / `checkX`）失败 → throw，由 HTTP/CLI 边界映射成 400；这是边界适配，不是业务 Result。
- 不变量破坏、编程错误、依赖挂了 → throw。
- 一个函数选定一种，内部不混用；throw ↔ Result 的转换只在边界做一次。
- `E` 用可辨识联合的失败数据（`{ code: 'NOT_FOUND'; id }`），不要用 `AppError` / `Error` 子类。
- Result 的失败数据可以带内部诊断 `cause`；cause 不是业务分支依据，也不进入 HTTP/wire；边界转回 `AppError` 时保留 cause。

### 9.5 Result 与 try/catch：两条通道

`try/catch` 是"跳出去"：异常展开栈，直到某个 catch 接住；`Result` 是"继续走"：函数把成功数据或失败数据带回来，调用方自己分支。两条通道都合法，但不能在同一条失败上混用。

- Result 用于可预期业务失败：找不到、业务规则拒绝、余额不足；调用方必须处理。
- try/catch 用于意外异常：依赖挂了、编程错误、不变量破坏、第三方库抛错；在边界接住，兜底记录。
- Result 的 error 是数据（可辨识联合），不是 `Error` 子类，不用 `AppError`；可序列化、可 pattern match、可聚合。
- 异常的错误是 `Error` 子类，带 `cause`/栈；只在异常通道用；`AppError` / `ConfigError` 只服务 throw。
- 不要混：返回 Result 的函数不为预期失败 throw；抛异常的函数不用 Result 表示同一个预期失败。一个函数选定一种，内部不混。
- 边界转换：adapter 可以 catch 外部异常，转成 Result 失败数据（或上抛给兜底）；API/UI 把 Result 失败映射成状态码/提示。转换只发生在边界，且只做一次。
- 边界解析/校验（`parseX` / `checkX`）可以 throw：由 HTTP/CLI 边界接住并映射成 400；它们不是业务 Result 的一部分。
- Result 用 `if (result.ok)` 或 `ts-pattern` 分支（见 6.6）；不要用 try/catch 包 Result 的 match。
- 测试：Result 分支断言数据；异常通道用 `expect(...).toThrow()`。

---

## 十、注释：好代码自解释，注释是例外

- 不写解释"是什么"的注释；如果代码说不清，先改名、拆函数、简化逻辑。
- 只在两种情况下写注释：特别困惑的地方（反直觉写法、非显而易见约束）和需要特别注意的地方（危险边界、性能陷阱、隐含前提）。
- 公共 API 的 TSDoc 要写清返回值语义、会抛什么、有什么约束。
- 不写分节分隔注释、不复述代码、不留注释掉的代码、不给显而易见的东西加注释；注释与代码同步，误导比没有更糟。
- 不留死代码；`TODO` 带责任人与 issue。

---

## 十一、测试：行为变更必须有测试

- 纯函数必测：输入输出就是契约。
- 边界解析必测：非法输入、缺失字段、类型错误至少各一条。
- 每个 bugfix 带回归测试：先写能复现的用例，再修。
- 测试与源码同构：`foo.ts` 对应 `foo.test.ts`；测试名描述行为，不描述实现。
- 确定性：时间、随机、id、I/O 从参数注入；测试里给固定替身。
- 不 mock 纯函数；mock 只放在网络/文件/时间等边界；不测实现细节。
- 测试代码遵守同样的类型和命名规则；fixture 里允许 `as`。
- 提交前跑测试；不通过不提交。

---

## 十二、评审自查与 Agent 工作协议

### 12.1 提交前自查

- [ ] **术语一致吗？** 与 `glossary.md` 一致；没有把 `Item` 这类领域术语用在通用工具函数上。
- [ ] **决策形态对了吗？** 树状决策是完整 `if / else`、入口并列校验按 `if / else if / else`；线性操作是顺序步骤、不补 `else`；都不 early return。
- [ ] **单入口检查是树吗？** 单入口“放行/拒绝”写成 `if (bad) { throw } else { main() }`，不是 `if (bad) throw; main()`。
- [ ] **`else if` / `else { if }` 分清了吗？** 同级兄弟才用 `else if`，跨层用嵌套；深了抽函数。
- [ ] **三元合规吗？** 多行 `?` / `:` 与条件第一个字符平齐；JSX 条件渲染是例外；条件都是 boolean，没有 truthiness。
- [ ] **有类 / this / getter / setter / Proxy 吗？** 除错误类型外都不该有；属性访问没有藏计算/校验/副作用。
- [ ] **箭头函数用对了吗？** 回调/函数值用箭头；模块级/导出/多行具名函数考虑 `function xxx() {}`；没有 `const foo = () =>` 套壳。
- [ ] **状态有唯一所有者吗？** 没有模块级 `let`、散落写操作；`get` 没漏可变引用；异步写串行化；`Memo` 订阅已卸载。
- [ ] **引用透明吗？** 核心表达式能否替换成结果而不改变行为？时间/随机/I/O/可变全局是否都在边界？
- [ ] **事件用 `Signal()` 了吗？** 没有 `emit('name')`；`receive` / `watch` / `ChangedSignal` 的 `off` 都在卸载/销毁时调用；没有重复订阅不取消。
- [ ] **控制反转 / 偏应用合规吗？** 只有需要选择时才加回调；偏应用只固定依赖/配置，没固定业务数据、没三层以上柯里化、没模块顶层绑定。
- [ ] **没有重度函数式吧？** 业务代码仍用普通 TS 的 `if` / `for` / `try`；没有为"纯粹"引入 `fp-ts` / `Effect` / monad。
- [ ] **多分支联合用 ts-pattern 了吗？** 3+ 分支/exhaustive；2 分支不过度用。
- [ ] **副作用集中吗？** I/O、时钟、随机、日志是否都在边界？核心是否保持引用透明？
- [ ] **副作用 / mutation 返回值合规吗？** 只返回 `void` / `Promise<void>` 或 `Result`；没有返回裸数据、布尔、数组长度。
- [ ] **数组整体替换吗？** 没有 `push` / `splice` / `sort` / `reverse` 等原地方法；用 `let $arr` + 新数组。
- [ ] **循环里没有跳转吗？** 没有 `continue` / `break`；查找用 `find` 或抽函数。
- [ ] **命名合规吗？** 导出带模块名、非导出省略；函数 camelCase；工厂 PascalCase；数据 snake_case；本地可变 `$name`；跨作用域 `_name` / `$_name`；自有组件 props 用 `foo_bar`；`useState` / `useMemo` 值用 `foo_bar`（不加 `_`）；`useRef` 对象用 `$name`。
- [ ] **模块 API 对象保留稳定名了吗？** Drizzle table / zod schema / React module descriptor 没有套纯数据命名。
- [ ] **`useCallback` 命名对了吗？** 返回函数值，按 `foo_bar` camelCase，没有加 `$` / `_`。
- [ ] **常量放对了吗？** `constants.ts`、命名导出、计算常量 re-export 收口；没有 `export default { ... }` 或可变对象。
- [ ] **类型契约还在吗？** 无 `any` / `!`；导出有返回类型；外部输入由 zod 产出，zod 之后才 parse/check；品牌用对。
- [ ] **外部输入过 zod 了吗？** `JSON.parse` / `request.body` / `query` / `env` / `fetch` / 文件没有直接 `as` 或信任静态类型。
- [ ] **校验工具选对了吗？** 能用 zod `.refine` / `.transform` / `.brand` 的没有手写 `parse`/`check`/`is`；手写工具只用于 zod 表达不了的约束；守卫是 `value is X`；`Is<T>` 显式给 `T`；`as<T>` 只用于测试/fixture/已校验边界。
- [ ] **空值 / 参数合规吗？** 默认 `null`；`undefined` 只在语言强加处；`NONE` 不参与 JSON；位置参数没有 `?`；默认值有真实语义。
- [ ] **catch 负责吗？** 包装 + cause / 判别后处理 / 不 catch；没有吞错；错误可判别；顶层有兜底且只记一次。
- [ ] **新增/变更行为有测试吗？** 注释是否多余？diff 是否只含本次任务相关改动？偏离有 `// justify` 吗？

### 12.2 Agent 工作协议

**开工前**：读 [glossary.md](glossary.md) 和本文；确认本次涉及的术语；看目标文件及邻近代码的既有风格。

**动手时**：

- 最小 diff：只改与任务相关的代码；不顺手重排、不批量改格式、不加依赖。
- 新代码遵守本文；旧代码只在与本次改动直接相关时迁移，不做全仓重构。
- 偏离硬规则时，就地写 `// justify: <节号> <理由>`，并在交付说明里列出；没有标注算违规。
- 不写解释性/总结性注释，不主动新建文档；示例是示意，不是模板。

**收尾**：跑项目规定的检查（lint、typecheck、test、build），贴结果；不通过不说"完成"；列出改动文件、公开 API 变化、偏离项、未解决项。

---

## 附录 A：改造速查表

| 看到 | 改成 | 依据 |
|---|---|---|
| `class Foo` / `this.` | 闭包工厂 / 对象字面量工厂 / 显式参数 | 第二节 |
| `const foo = () => { ... }`（模块级/导出/多行） | `function foo() { ... }`；箭头留给回调和函数值 | 第七节 |
| `{ get name() {} }` / `set name(v) {}` / `Proxy` | 显式函数 / `Signal` / `Memo` / `Map` | 2.3 |
| `if (x) return` 后接逻辑 | 树状决策写完整 `if / else`；入口并列校验 `if / else if / else`；线性操作按顺序做步骤；都不 early return | 第一节 |
| `if (bad) throw; main`（单入口） | `if (bad) { throw } else { main() }`；单入口也是判决树 | 第一节 |
| `else if` 压平子层 | `else { if }` 嵌套，或抽命名函数 | 第一节 |
| 多行三元按固定缩进 | `?` / `:` 与条件第一个字符对齐；JSX 条件渲染例外 | 1.1 |
| `if (items.length)` / `value ? ...` | `if (items.length > 0)` / `value !== null ? ...`；条件必须 boolean | 1.2 |
| 循环里 `break` / `continue` | `find` / 抽查找函数 / `if` 包裹 | 第四节 |
| `arr.push` / `splice` / `sort` / `reverse` | `let $arr`；`$arr = [...$arr, x]` / `$arr = $arr.slice(0, 3)`；不原地改 | 第三节 |
| 有副作用 / mutation 却返回裸数据 | 返回 `void` / `Promise<void>` 或 `Result`；纯查询才返回数据 | 第三节 |
| `catch { return null }` / `return []` | 包装 + cause / 判别后处理 / Result | 9.1 |
| `catch (e) { log(e); throw e }` | 删掉 log，让兜底记一次 | 9.2 |
| `any` / `!` | `unknown` + zod/parse/check；显式判空 | 第六节 |
| 外部数据上 `as Foo` / 手写 `parseFoo` | 先过 `zFoo.parse(raw)`；类型用 `z.infer`；zod 之后才 parse/check | 6.4 |
| 手写 `parseX` / `checkX` / `isX` 做 zod 能做的校验 | 用 `.refine` / `.transform` / `.brand` 写进 schema，或复用已有 schema/谓词 | 5.7 |
| `request.body as Body` / `JSON.parse(x) as Foo` / `process.env as Env` | 先过 zod schema；静态类型只在可信/可控时信任 | 6.4 |
| `asUserId` / `asGallery` | `as<UserID>` / `as<Gallery>`（只测试/已校验边界） | 5.7 |
| 临时写 `function Is` / `function as` | 从 `@laibrary/types` 导入；来源 `packages/types/src/is.ts` / `as.ts` | 5.7 |
| `as<GalleryID>(undefined)` | `AsInput<T>` 挡住；先处理 null/undefined | 5.7 |
| `isGallery(v): boolean` | `isGallery(v): v is Gallery`；用 `Is<T>` 或具体谓词 | 5.7 |
| `Is(...)` 不写 `<T>` | 写 `Is<Gallery>(...)`；否则收窄成 unknown | 5.7 |
| 业务数据被偏应用固定 / `f(a)(b)(c)` | 数据显式传；最多偏应用一次，不做多层柯里化 | 2.1 |
| `let count` / 可变的 `_state` | 本地可变 `$count`；跨作用域只读 `const _state`；跨作用域可变 `$_state`；全局常量 `FOO_BAR`；口诀见 5.4 | 5.4 |
| camelCase props / 形参跨作用域 | 自有组件 props 用 `foo_bar`；形参默认不可变，跨作用域 `_foo_bar`，可变 `$foo_bar` | 5.4 |
| `CreateUserApi(base_url)`（闭包捕获） | `CreateUserApi(_base_url)`；未捕获 `base_url`，可变 `$base_url`，两者 `$_base_url` | 5.3 / 5.4 |
| `useCallback` 返回值 | `foo_bar` camelCase，不加 `$` / `_` | 5.4 |
| 模块 API 对象 | 保留稳定接口名（`items` / `zItem` / `__PAGE_MODULE__`） | 5.2 |
| 引入 ts-effect / fp-ts / monad / functor | 普通 TS：if/for/try + Result | 2.2 |
| Result 的 error 用 Error 子类 / 在 Result 函数里 throw 预期失败 | 失败数据（可辨识联合）；边界转换才 catch | 9.5 |
| `emit('event name')` / 用 Memo 当事件总线 | `signals.sig_name.receive(...)`（Signal）/ 发布 `trigger`；普通状态用闭包 | 8.2 |
| `receive` / `watch` 后不取消 | 卸载/销毁时调用返回的 `off` | 8.2 |
| 导出 `inEvent` / `canSubmit` | `galleryInEvent` / `galleryCanSubmit` | 5.2 |
| `export default { FOO }` | `export const MODULE_FOO = ...`（`constants.ts` 命名导出） | 5.2 / 8.1 |
| 函数读 Date.now / Math.random / 可变全局 | 参数注入或推到边界；核心保持引用透明 | 第三节 |

---

> 一句话总结：**决策是树，操作是线；用组合而不是对象状态表达逻辑；让名字和类型说清意图；让副作用集中在边界、核心引用透明；让状态只有一个所有者；让每个 catch 负责、统一兜底、保留根因；让代码自己说话，只在必要处解释。**
