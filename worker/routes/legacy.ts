import { Hono } from 'hono'
import { qunCommentsFindPage } from '../db'
import type { QunEnv } from '../env'

export const qunLegacyRoutes = new Hono<{ Bindings: QunEnv }>()

qunLegacyRoutes.get('/', async (c) => {
  const accept = c.req.header('Accept') ?? ''
  const is_navigation =
    c.req.header('Sec-Fetch-Mode') === 'navigate' || accept.includes('text/html')
  if (is_navigation) {
    return c.redirect('/guestbook', 302)
  } else {
    c.header('Deprecation', 'true')
    c.header('Link', '</guestbook>; rel="alternate"')
    const page_raw = c.req.query('page')
    const page = page_raw === undefined ? Number.NaN : Number(page_raw)
    if (!Number.isInteger(page) || page < 1) {
      return c.json({ code: 1, msg: 'page required' })
    } else {
      const page_data = await qunCommentsFindPage(c.env.DB, page, 10)
      return c.json({
        code: 0,
        msg: page_data.items.map((comment) => ({
          id: comment.id,
          author: comment.author,
          article: comment.article,
          time: comment.created_at,
        })),
      })
    }
  }
})

qunLegacyRoutes.post('/', (c) => {
  return c.json(
    {
      code: 1,
      msg: '留言板已升级，请访问 /guestbook',
    },
    410,
  )
})
