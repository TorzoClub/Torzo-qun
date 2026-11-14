import { Hono } from 'hono'
import { zQunAdminPageQuery } from '../../shared/schema'
import { qunCommentDelete, qunCommentsCount, qunCommentsFindPage } from '../db'
import type { QunEnv } from '../env'
import { QunAppError } from '../errors'
import { qunRequireAdmin, qunValidationError } from '../http'

export const qunAdminRoutes = new Hono<{ Bindings: QunEnv }>()

qunAdminRoutes.use('*', async (c, next) => {
  qunRequireAdmin(c)
  await next()
})

qunAdminRoutes.get('/comments', async (c) => {
  const query = zQunAdminPageQuery.safeParse(c.req.query())
  if (!query.success) {
    throw qunValidationError(query.error)
  } else {
    const page = await qunCommentsFindPage(c.env.DB, query.data.page, query.data.page_size)
    return c.json(page)
  }
})

qunAdminRoutes.delete('/comments/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    throw new QunAppError({
      code: 'BAD_REQUEST',
      message: '留言 id 不正确',
      status: 400,
    })
  } else {
    const deleted = await qunCommentDelete(c.env.DB, id)
    if (!deleted.ok) {
      throw new QunAppError({
        code: 'SERVICE_UNAVAILABLE',
        message: '删除留言失败，请稍后再试',
        status: 503,
        cause: deleted.error.cause,
      })
    } else {
      if (!deleted.data) {
        throw new QunAppError({
          code: 'NOT_FOUND',
          message: '这条留言不存在',
          status: 404,
        })
      } else {
        const total = await qunCommentsCount(c.env.DB)
        return c.json({ ok: true, total })
      }
    }
  }
})
