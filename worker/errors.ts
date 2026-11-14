export type QunHttpStatus = 400 | 403 | 404 | 413 | 415 | 422 | 429 | 500 | 503

export type QunErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RATE_LIMITED'
  | 'TURNSTILE_FAILED'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export type QunAppErrorOptions = {
  code: QunErrorCode
  message: string
  status: QunHttpStatus
  fields?: Readonly<Record<string, string>>
  retry_after_seconds?: number
  cause?: unknown
}

export class QunAppError extends Error {
  readonly code: QunErrorCode
  readonly status: QunHttpStatus
  readonly fields: Readonly<Record<string, string>> | null
  readonly retry_after_seconds: number | null

  constructor(options: QunAppErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = 'QunAppError'
    this.code = options.code
    this.status = options.status
    this.fields = options.fields ?? null
    this.retry_after_seconds = options.retry_after_seconds ?? null
  }
}
