export type QunEnv = {
  readonly DB: D1Database
  readonly ENVIRONMENT: string
  readonly TURNSTILE_ENABLED: string
  readonly ALLOW_TURNSTILE_FALLBACK: string
  readonly TURNSTILE_SECRET_KEY: string
  readonly IP_HASH_SALT: string
}
