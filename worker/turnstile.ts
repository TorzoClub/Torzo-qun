import { type Result, resultErr, resultOk } from '../shared/result'
import { zQunTurnstileResponse } from '../shared/schema'

export type QunTurnstileFailure = {
  readonly code: string
  readonly message: string
  readonly cause: unknown
}

export async function qunTurnstileVerify(
  token: string,
  secret: string,
  remote_ip: string | null,
): Promise<Result<boolean, QunTurnstileFailure>> {
  try {
    const form = new FormData()
    form.set('secret', secret)
    form.set('response', token)
    if (remote_ip !== null) {
      form.set('remoteip', remote_ip)
    }
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    if (!response.ok) {
      return resultErr({
        code: 'TURNSTILE_HTTP_ERROR',
        message: `Turnstile 返回 HTTP ${response.status}`,
        cause: null,
      })
    } else {
      const body: unknown = await response.json()
      const parsed = zQunTurnstileResponse.safeParse(body)
      if (!parsed.success) {
        return resultErr({
          code: 'TURNSTILE_INVALID_RESPONSE',
          message: 'Turnstile 响应格式不正确',
          cause: parsed.error,
        })
      } else {
        return resultOk(parsed.data.success)
      }
    }
  } catch (error: unknown) {
    return resultErr({
      code: 'TURNSTILE_NETWORK_ERROR',
      message: 'Turnstile 验证请求失败',
      cause: error,
    })
  }
}
