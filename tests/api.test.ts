import { afterEach, describe, expect, it, vi } from 'vitest'
import { qunAdminCommentDelete, qunCommentCreate, qunCommentsFetchPage } from '../src/lib/api'

const comment = {
  id: 79,
  author: 'vec',
  article: '这是一条足够长的留言正文，用来测试 API 客户端。',
  created_at: '2025-04-27T21:17:46.000Z',
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('留言 API 客户端', () => {
  it('读取分页数据', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          {
            items: [comment],
            page: 1,
            page_size: 10,
            total: 1,
            has_more: false,
          },
          200,
        ),
      ),
    )
    const result = await qunCommentsFetchPage(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.total).toBe(1)
      expect(result.data.items[0]?.author).toBe('vec')
    }
  })

  it('把 429 映射成可读的失败数据', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          {
            error: {
              code: 'RATE_LIMITED',
              message: '慢一点',
              retry_after_seconds: 120,
            },
          },
          429,
        ),
      ),
    )
    const result = await qunCommentsFetchPage(1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('RATE_LIMITED')
      expect(result.error.retry_after_seconds).toBe(120)
    }
  })

  it('网络错误不会抛出，而是返回 Result 失败', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    const result = await qunCommentsFetchPage(1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NETWORK_ERROR')
    }
  })

  it('提交留言', async () => {
    const fetch_mock = vi.fn(async () => jsonResponse({ comment }, 201))
    vi.stubGlobal('fetch', fetch_mock)
    const result = await qunCommentCreate({
      author: 'vec',
      article: '这是一条足够长的留言正文，用来测试提交。',
      turnstile_token: '',
      turnstile_unavailable: true,
      website: '',
      started_at: 1760000000000,
      client_id: 'q-abcdefgh',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe(79)
    }
    expect(fetch_mock).toHaveBeenCalledTimes(1)
    const call = fetch_mock.mock.calls[0]
    expect(call?.[1]?.method).toBe('POST')
  })

  it('删除留言并回传总数', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true, total: 3 }, 200)),
    )
    const result = await qunAdminCommentDelete(4)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.total).toBe(3)
    }
  })
})
