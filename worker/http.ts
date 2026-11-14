import type { Context, Next } from 'hono'
import type { ZodError } from 'zod'
import { QUN_ALLOWED_ORIGINS, QUN_COMMENT_BODY_MAX_BYTES } from '../shared/constants'
import type { QunEnv } from './env'
import { QunAppError } from './errors'

export type QunWorkerContext = Context<{ Bindings: QunEnv }>

export async function qunNoStore(c: QunWorkerContext, next: Next): Promise<void> {
  await next()
  c.header('Cache-Control', 'no-store')
  c.header('X-Content-Type-Options', 'nosniff')
}

export async function qunReadJson(c: QunWorkerContext): Promise<unknown> {
  const content_type = c.req.header('Content-Type') ?? ''
  if (!content_type.includes('application/json')) {
    throw new QunAppError({
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: '请求必须是 application/json',
      status: 415,
    })
  } else {
    const text = await c.req.text()
    if (text.length > QUN_COMMENT_BODY_MAX_BYTES) {
      throw new QunAppError({
        code: 'PAYLOAD_TOO_LARGE',
        message: '留言太长了',
        status: 413,
      })
    } else {
      try {
        const parsed: unknown = JSON.parse(text)
        return parsed
      } catch (error: unknown) {
        throw new QunAppError({
          code: 'BAD_REQUEST',
          message: '请求不是合法的 JSON',
          status: 400,
          cause: error,
        })
      }
    }
  }
}

export function qunValidationError(error: ZodError): QunAppError {
  return new QunAppError({
    code: 'VALIDATION_ERROR',
    message: '有几项填写不正确',
    status: 422,
    fields: Object.fromEntries(
      error.issues.map((issue) => [
        issue.path.length === 0 ? 'form' : issue.path.join('.'),
        issue.message,
      ]),
    ),
    cause: error,
  })
}

export function qunOriginIsAllowed(c: QunWorkerContext): boolean {
  const origin = c.req.header('Origin')
  if (origin === undefined || origin === '') {
    return true
  } else {
    return QUN_ALLOWED_ORIGINS.some((allowed_origin) => allowed_origin === origin)
  }
}

export function qunRequireAdmin(c: QunWorkerContext): void {
  if (c.env.ENVIRONMENT === 'development') {
    return
  } else {
    const host = c.req.header('Host') ?? ''
    if (host !== 'guide.torzo.club' && host !== 'qun.torzo.club') {
      throw new QunAppError({
        code: 'FORBIDDEN',
        message: '后台只允许从正式域名访问',
        status: 403,
      })
    } else {
      const email = c.req.header('Cf-Access-Authenticated-User-Email')
      const assertion = c.req.header('Cf-Access-Jwt-Assertion')
      if (email === undefined || email === '' || assertion === undefined || assertion === '') {
        throw new QunAppError({
          code: 'FORBIDDEN',
          message: '需要 Cloudflare Access 登录',
          status: 403,
        })
      } else {
        return
      }
    }
  }
}
