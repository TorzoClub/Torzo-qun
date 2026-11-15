import { QUN_COMMENT_DUPLICATE_WINDOW_MS } from '../shared/constants'
import { type Result, type WriteFailure, writeRun } from '../shared/result'
import { type QunComment, type QunCommentPage, zQunCommentRow } from '../shared/schema'

function rowToComment(row: unknown): QunComment {
  const parsed = zQunCommentRow.safeParse(row)
  if (!parsed.success) {
    throw new Error('数据库里的留言格式不正确', { cause: parsed.error })
  } else {
    return {
      id: parsed.data.id,
      author: parsed.data.author,
      article: parsed.data.article,
      created_at: new Date(parsed.data.created_at).toISOString(),
    }
  }
}

export async function qunCommentsFindPage(
  db: D1Database,
  page: number,
  page_size: number,
): Promise<QunCommentPage> {
  const offset = (page - 1) * page_size
  const [rows_result, count_row] = await Promise.all([
    db
      .prepare(
        'SELECT id, author, article, created_at FROM comments ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
      )
      .bind(page_size, offset)
      .all<unknown>(),
    db.prepare('SELECT COUNT(*) AS count FROM comments').first<{ count: number }>(),
  ])
  const items = rows_result.results.map(rowToComment)
  const total = count_row?.count ?? 0
  return {
    items,
    page,
    page_size,
    total,
    has_more: page * page_size < total,
  }
}

export async function qunCommentsCount(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS count FROM comments').first<{ count: number }>()
  return row?.count ?? 0
}

export async function qunCommentFindByID(db: D1Database, id: number): Promise<QunComment | null> {
  const row = await db
    .prepare('SELECT id, author, article, created_at FROM comments WHERE id = ?')
    .bind(id)
    .first<unknown>()
  if (row === null || row === undefined) {
    return null
  } else {
    return rowToComment(row)
  }
}

export async function qunCommentFindByClientID(
  db: D1Database,
  client_id: string,
): Promise<QunComment | null> {
  const row = await db
    .prepare('SELECT id, author, article, created_at FROM comments WHERE client_id = ?')
    .bind(client_id)
    .first<unknown>()
  if (row === null || row === undefined) {
    return null
  } else {
    return rowToComment(row)
  }
}

export async function qunCommentFindDuplicate(
  db: D1Database,
  author: string,
  article: string,
  now: number,
): Promise<QunComment | null> {
  const row = await db
    .prepare(
      'SELECT id, author, article, created_at FROM comments WHERE author = ? AND article = ? AND created_at > ? ORDER BY id DESC LIMIT 1',
    )
    .bind(author, article, now - QUN_COMMENT_DUPLICATE_WINDOW_MS)
    .first<unknown>()
  if (row === null || row === undefined) {
    return null
  } else {
    return rowToComment(row)
  }
}

export type QunCommentInsert = {
  readonly author: string
  readonly article: string
  readonly created_at: number
  readonly ip_hash: string
  readonly client_id: string
}

export async function qunCommentInsert(
  db: D1Database,
  input: QunCommentInsert,
): Promise<Result<QunComment, WriteFailure>> {
  return writeRun(async () => {
    const result = await db
      .prepare(
        "INSERT OR IGNORE INTO comments (author, article, created_at, ip_hash, client_id, source) VALUES (?, ?, ?, ?, ?, 'web')",
      )
      .bind(input.author, input.article, input.created_at, input.ip_hash, input.client_id)
      .run()
    if (result.meta.changes === 0) {
      const existing = await qunCommentFindByClientID(db, input.client_id)
      if (existing === null) {
        throw new Error('留言写入冲突，但找不到已有留言')
      } else {
        return existing
      }
    } else {
      const comment = await qunCommentFindByID(db, result.meta.last_row_id)
      if (comment === null) {
        throw new Error('留言写入后读不回来')
      } else {
        return comment
      }
    }
  })
}

export async function qunCommentDelete(
  db: D1Database,
  id: number,
): Promise<Result<boolean, WriteFailure>> {
  return writeRun(async () => {
    const result = await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  })
}
