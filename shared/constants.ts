export const QUN_COMMENT_PAGE_SIZE = 10
export const QUN_COMMENT_PAGE_SIZE_MAX = 50
export const QUN_ADMIN_PAGE_SIZE = 20
export const QUN_COMMENT_AUTHOR_MAX = 16
export const QUN_COMMENT_ARTICLE_MIN = 20
export const QUN_COMMENT_ARTICLE_MAX = 2000
export const QUN_COMMENT_BODY_MAX_BYTES = 16 * 1024
export const QUN_COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000
export const QUN_COMMENT_RATE_MAX = 3
export const QUN_COMMENT_COOLDOWN_MS = 30 * 1000
export const QUN_COMMENT_FALLBACK_WINDOW_MS = 30 * 60 * 1000
export const QUN_COMMENT_FALLBACK_MAX = 1
export const QUN_COMMENT_DUPLICATE_WINDOW_MS = 10 * 60 * 1000
export const QUN_COMMENT_DWELL_MIN_MS = 3000
export const QUN_COMMENT_DWELL_MAX_MS = 24 * 60 * 60 * 1000
export const QUN_TIME_ZONE = 'Asia/Shanghai'
export const QUN_SITE_NAME = '同装导册'

export const QUN_ALLOWED_ORIGINS = [
  'https://guide.torzo.club',
  'https://qun.torzo.club',
  'http://localhost:5173',
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
] as const
