import { Hono } from 'hono'
import { QUN_SITE_NAME } from '../shared/constants'
import type { QunEnv } from './env'
import { QunAppError } from './errors'
import { qunNoStore } from './http'
import { qunAdminRoutes } from './routes/admin'
import { qunCommentRoutes } from './routes/comments'
import { qunLegacyRoutes } from './routes/legacy'

const qunWorker = new Hono<{ Bindings: QunEnv }>()

qunWorker.use('*', qunNoStore)

qunWorker.get('/api/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first()
    return c.json({ ok: true, db: 'ok', site: QUN_SITE_NAME })
  } catch (error: unknown) {
    throw new QunAppError({
      code: 'SERVICE_UNAVAILABLE',
      message: '数据库暂时不可用',
      status: 503,
      cause: error,
    })
  }
})

qunWorker.route('/api/comments', qunCommentRoutes)
qunWorker.route('/api/admin', qunAdminRoutes)
qunWorker.route('/comment', qunLegacyRoutes)

qunWorker.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: '接口不存在',
      },
    },
    404,
  )
})

qunWorker.onError((error, c) => {
  if (error instanceof QunAppError) {
    if (error.retry_after_seconds !== null) {
      c.header('Retry-After', String(error.retry_after_seconds))
    }
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields === null ? {} : { fields: error.fields }),
          ...(error.retry_after_seconds === null
            ? {}
            : { retry_after_seconds: error.retry_after_seconds }),
        },
      },
      error.status,
    )
  } else {
    console.error('unhandled worker error', error)
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器暂时开小差了',
        },
      },
      500,
    )
  }
})

export default qunWorker
