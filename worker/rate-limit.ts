import {
  QUN_COMMENT_COOLDOWN_MS,
  QUN_COMMENT_FALLBACK_MAX,
  QUN_COMMENT_FALLBACK_WINDOW_MS,
  QUN_COMMENT_RATE_MAX,
  QUN_COMMENT_RATE_WINDOW_MS,
} from '../shared/constants'

export type QunRateDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retry_after_seconds: number }

export async function qunCommentRateCheck(
  db: D1Database,
  ip_hash: string,
  now: number,
  is_fallback: boolean,
): Promise<QunRateDecision> {
  const window_ms = is_fallback ? QUN_COMMENT_FALLBACK_WINDOW_MS : QUN_COMMENT_RATE_WINDOW_MS
  const max_count = is_fallback ? QUN_COMMENT_FALLBACK_MAX : QUN_COMMENT_RATE_MAX
  const count_row = await db
    .prepare('SELECT COUNT(*) AS count FROM comments WHERE ip_hash = ? AND created_at > ?')
    .bind(ip_hash, now - window_ms)
    .first<{ count: number }>()
  const count = count_row?.count ?? 0
  if (count >= max_count) {
    return {
      allowed: false,
      retry_after_seconds: Math.ceil(window_ms / 1000),
    }
  } else {
    const last_row = await db
      .prepare('SELECT MAX(created_at) AS last_created_at FROM comments WHERE ip_hash = ?')
      .bind(ip_hash)
      .first<{ last_created_at: number | null }>()
    const last_created_at = last_row?.last_created_at ?? null
    if (last_created_at === null) {
      return { allowed: true }
    } else {
      const elapsed = now - last_created_at
      if (elapsed < QUN_COMMENT_COOLDOWN_MS) {
        return {
          allowed: false,
          retry_after_seconds: Math.ceil((QUN_COMMENT_COOLDOWN_MS - elapsed) / 1000),
        }
      } else {
        return { allowed: true }
      }
    }
  }
}

export async function qunHashIP(ip: string, salt: string, now: number): Promise<string> {
  const date = new Date(now).toISOString().slice(0, 10)
  const bytes = new TextEncoder().encode(`${salt}:${date}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}
