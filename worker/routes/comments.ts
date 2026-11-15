import { Hono } from 'hono'
import { QUN_COMMENT_DWELL_MAX_MS, QUN_COMMENT_DWELL_MIN_MS } from '../../shared/constants'
import {
  type QunCommentCreateInput,
  zQunCommentCreateInput,
  zQunPageQuery,
} from '../../shared/schema'
import {
  qunCommentFindByClientID,
  qunCommentFindDuplicate,
  qunCommentInsert,
  qunCommentsFindPage,
} from '../db'
import type { QunEnv } from '../env'
import { QunAppError } from '../errors'
import { type QunWorkerContext, qunOriginIsAllowed, qunReadJson, qunValidationError } from '../http'
import { qunCommentRateCheck, qunHashIP } from '../rate-limit'
import { qunTurnstileVerify } from '../turnstile'

export const qunCommentRoutes = new Hono<{ Bindings: QunEnv }>()

function assertOrigin(c: QunWorkerContext): void {
  if (!qunOriginIsAllowed(c)) {
    throw new QunAppError({
      code: 'FORBIDDEN',
      message: '这个来源不能留言',
      status: 403,
    })
  } else {
    return
  }
}

function assertSpamSignals(input: QunCommentCreateInput, now: number): void {
  const elapsed = now - input.started_at
  if (input.website !== '') {
    throw new QunAppError({
      code: 'BAD_REQUEST',
      message: '留言无法提交',
      status: 400,
    })
  } else if (elapsed < QUN_COMMENT_DWELL_MIN_MS || elapsed > QUN_COMMENT_DWELL_MAX_MS) {
    throw new QunAppError({
      code: 'BAD_REQUEST',
      message: '页面停留时间不对，请刷新后再试',
      status: 400,
    })
  } else {
    return
  }
}

async function assertTurnstile(
  c: QunWorkerContext,
  input: QunCommentCreateInput,
  is_fallback: boolean,
): Promise<void> {
  if (c.env.TURNSTILE_ENABLED !== 'true') {
    return
  } else {
    if (input.turnstile_token !== '') {
      const remote_ip = c.req.header('CF-Connecting-IP') ?? null
      const verification = await qunTurnstileVerify(
        input.turnstile_token,
        c.env.TURNSTILE_SECRET_KEY,
        remote_ip,
      )
      if (!verification.ok) {
        throw new QunAppError({
          code: 'SERVICE_UNAVAILABLE',
          message: '验证服务暂时不可用，请稍后再试',
          status: 503,
          cause: verification.error.cause,
        })
      } else {
        if (!verification.data) {
          throw new QunAppError({
            code: 'TURNSTILE_FAILED',
            message: '人机验证没有通过，请刷新后再试',
            status: 403,
          })
        } else {
          return
        }
      }
    } else {
      if (is_fallback && c.env.ALLOW_TURNSTILE_FALLBACK === 'true') {
        return
      } else {
        throw new QunAppError({
          code: 'TURNSTILE_FAILED',
          message: '请先完成人机验证',
          status: 403,
        })
      }
    }
  }
}

qunCommentRoutes.get('/', async (c) => {
  const query = zQunPageQuery.safeParse(c.req.query())
  if (!query.success) {
    throw qunValidationError(query.error)
  } else {
    const page = await qunCommentsFindPage(c.env.DB, query.data.page, query.data.page_size)
    return c.json(page)
  }
})

qunCommentRoutes.post('/', async (c) => {
  assertOrigin(c)
  const body = await qunReadJson(c)
  const parsed = zQunCommentCreateInput.safeParse(body)
  if (!parsed.success) {
    throw qunValidationError(parsed.error)
  } else {
    const input = parsed.data
    const now = Date.now()
    assertSpamSignals(input, now)
    const existing = await qunCommentFindByClientID(c.env.DB, input.client_id)
    if (existing !== null) {
      return c.json({ comment: existing }, 200)
    } else {
      const remote_ip = c.req.header('CF-Connecting-IP') ?? 'local'
      const ip_hash = await qunHashIP(remote_ip, c.env.IP_HASH_SALT, now)
      const is_fallback = input.turnstile_token === '' && input.turnstile_unavailable
      const rate = await qunCommentRateCheck(c.env.DB, ip_hash, now, is_fallback)
      if (!rate.allowed) {
        throw new QunAppError({
          code: 'RATE_LIMITED',
          message: '慢一点，装逼也要喘口气。',
          status: 429,
          retry_after_seconds: rate.retry_after_seconds,
        })
      } else {
        await assertTurnstile(c, input, is_fallback)
        const duplicate = await qunCommentFindDuplicate(c.env.DB, input.author, input.article, now)
        if (duplicate !== null) {
          return c.json({ comment: duplicate }, 200)
        } else {
          const inserted = await qunCommentInsert(c.env.DB, {
            author: input.author,
            article: input.article,
            created_at: now,
            ip_hash,
            client_id: input.client_id,
          })
          if (!inserted.ok) {
            throw new QunAppError({
              code: 'SERVICE_UNAVAILABLE',
              message: '留言暂时写不进去，请稍后再试',
              status: 503,
              cause: inserted.error.cause,
            })
          } else {
            return c.json({ comment: inserted.data }, 201)
          }
        }
      }
    }
  }
})
