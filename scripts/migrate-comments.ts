import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'

const zLegacyComment = z.object({
  id: z.number().int().positive(),
  author: z.string(),
  article: z.string(),
  time: z.string(),
})

const zLegacyPage = z.object({
  code: z.number(),
  msg: z.array(zLegacyComment),
})

type LegacyComment = z.infer<typeof zLegacyComment>

type MigrationOptions = {
  readonly base_url: string
  readonly out_path: string
  readonly sql_path: string
  readonly dry_run: boolean
  readonly verify_url: string | null
}

const DEFAULT_BASE_URL = 'https://guide.torzo.club'
const DEFAULT_OUT_PATH = 'data/legacy-comments.json'
const DEFAULT_SQL_PATH = 'data/import.sql'
const PAGE_LIMIT = 100
const BATCH_SIZE = 20

function delay(ms: number): Promise<void> {
  return new Promise((resolve_delay) => {
    setTimeout(resolve_delay, ms)
  })
}

function readArg(args: readonly string[], name: string): string | null {
  const index = args.indexOf(`--${name}`)
  if (index === -1) {
    return null
  } else {
    return args[index + 1] ?? null
  }
}

function parseOptions(args: readonly string[]): MigrationOptions {
  const base_url_arg = readArg(args, 'base-url')
  const out_arg = readArg(args, 'out')
  const sql_arg = readArg(args, 'sql')
  const verify_arg = readArg(args, 'verify-url')
  return {
    base_url: (base_url_arg ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
    out_path: out_arg ?? DEFAULT_OUT_PATH,
    sql_path: sql_arg ?? DEFAULT_SQL_PATH,
    dry_run: args.includes('--dry-run'),
    verify_url: verify_arg === null ? null : verify_arg.replace(/\/+$/, ''),
  }
}

async function fetchPage(
  base_url: string,
  page: number,
  attempt: number,
): Promise<readonly LegacyComment[]> {
  try {
    const response = await fetch(`${base_url}/comment?page=${page}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Torzo-qun-migrator/2.0',
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(`旧接口返回 HTTP ${response.status}`)
    } else {
      const body: unknown = await response.json()
      const parsed = zLegacyPage.safeParse(body)
      if (!parsed.success) {
        throw new Error('旧接口响应格式不正确', { cause: parsed.error })
      } else if (parsed.data.code !== 0) {
        throw new Error(`旧接口返回 code=${parsed.data.code}`)
      } else {
        return parsed.data.msg
      }
    }
  } catch (error: unknown) {
    if (attempt >= 3) {
      throw new Error(`读取第 ${page} 页失败（已重试 3 次）`, { cause: error })
    } else {
      await delay(attempt * 800)
      return fetchPage(base_url, page, attempt + 1)
    }
  }
}

async function fetchAllComments(base_url: string): Promise<readonly LegacyComment[]> {
  let $comments: readonly LegacyComment[] = []
  let $page = 1
  let $has_more = true
  while ($has_more) {
    const page_comments = await fetchPage(base_url, $page, 1)
    console.log(`page ${$page}: ${page_comments.length} 条`)
    if (page_comments.length === 0) {
      $has_more = false
    } else {
      $comments = [...$comments, ...page_comments]
      $page += 1
      if ($page > PAGE_LIMIT) {
        throw new Error(`超过 ${PAGE_LIMIT} 页，停止抓取`)
      }
    }
  }
  return $comments
}

function uniqueComments(comments: readonly LegacyComment[]): readonly LegacyComment[] {
  const by_id = new Map<number, LegacyComment>()
  for (const comment of comments) {
    if (!by_id.has(comment.id)) {
      by_id.set(comment.id, comment)
    }
  }
  return Array.from(by_id.values()).toSorted((left, right) => left.id - right.id)
}

function validateComments(comments: readonly LegacyComment[]): void {
  for (const comment of comments) {
    if (comment.author.trim() === '') {
      throw new Error(`id=${comment.id} 的作者为空`)
    } else if (comment.article.trim() === '') {
      throw new Error(`id=${comment.id} 的正文为空`)
    } else if (Number.isNaN(Date.parse(comment.time))) {
      throw new Error(`id=${comment.id} 的时间无法解析: ${comment.time}`)
    }
  }
}

function checksum(comments: readonly LegacyComment[]): string {
  const payload = comments
    .map(
      (comment) =>
        `${comment.id}\u0001${comment.author}\u0001${comment.article}\u0001${comment.time}`,
    )
    .join('\u0002')
  return createHash('sha256').update(payload).digest('hex')
}

function escapeSql(value: string): string {
  return value.replaceAll("'", "''")
}

function buildInsertSql(comments: readonly LegacyComment[]): string {
  let $statements: readonly string[] = []
  for (let index = 0; index < comments.length; index += BATCH_SIZE) {
    const batch = comments.slice(index, index + BATCH_SIZE)
    const values = batch
      .map(
        (comment) =>
          `(${comment.id}, '${escapeSql(comment.author)}', '${escapeSql(comment.article)}', ${Date.parse(comment.time)}, 'legacy')`,
      )
      .join(',\n')
    $statements = [
      ...$statements,
      `INSERT OR IGNORE INTO comments (id, author, article, created_at, source) VALUES\n${values};`,
    ]
  }
  return `${$statements.join('\n\n')}\n`
}

async function writeOutputs(
  options: MigrationOptions,
  comments: readonly LegacyComment[],
): Promise<void> {
  const hash = checksum(comments)
  await mkdir(resolve(process.cwd(), 'data'), { recursive: true })
  await writeFile(
    resolve(process.cwd(), options.out_path),
    `${JSON.stringify(comments, null, 2)}\n`,
    'utf8',
  )
  await writeFile(
    resolve(process.cwd(), options.out_path.replace(/\.json$/, '.sha256')),
    `${hash}\n`,
    'utf8',
  )
  await writeFile(resolve(process.cwd(), options.sql_path), buildInsertSql(comments), 'utf8')
  console.log(`写入 ${options.out_path}（${comments.length} 条）`)
  console.log(`写入 ${options.out_path.replace(/\.json$/, '.sha256')}`)
  console.log(`写入 ${options.sql_path}`)
}

async function verifyAgainst(
  verify_url: string,
  expected: readonly LegacyComment[],
): Promise<void> {
  const actual = await fetchAllComments(verify_url)
  if (actual.length !== expected.length) {
    throw new Error(`验证失败：旧站 ${expected.length} 条，新站 ${actual.length} 条`)
  } else {
    const expected_by_id = new Map(expected.map((comment) => [comment.id, comment]))
    for (const comment of actual) {
      const old = expected_by_id.get(comment.id)
      if (
        old === undefined ||
        old.author !== comment.author ||
        old.article !== comment.article ||
        old.time !== comment.time
      ) {
        throw new Error(`验证失败：id=${comment.id} 的内容不一致`)
      }
    }
    console.log(`验证通过：${actual.length} 条留言与旧站一致`)
  }
}

const options = parseOptions(process.argv.slice(2))
const comments = await fetchAllComments(options.base_url)
const unique = uniqueComments(comments)
validateComments(unique)
console.log(`共抓到 ${comments.length} 条，去重后 ${unique.length} 条`)
console.log(`最早 id=${unique[0]?.id ?? '—'}，最晚 id=${unique[unique.length - 1]?.id ?? '—'}`)
console.log(`checksum: ${checksum(unique)}`)
if (options.dry_run) {
  console.log('dry-run：未写入任何文件')
} else {
  await writeOutputs(options, unique)
}
if (options.verify_url !== null) {
  await verifyAgainst(options.verify_url, unique)
}
