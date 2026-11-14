import { describe, expect, it } from 'vitest'
import { zQunCommentCreateInput, zQunCommentDraft } from '../shared/schema'

const valid_article = '这是一篇足够长的留言正文，用来测试 Zod 校验。'

describe('留言 schema', () => {
  it('会 trim 作者和正文', () => {
    const parsed = zQunCommentDraft.parse({
      author: '  vec  ',
      article: `  ${valid_article}  `,
    })
    expect(parsed.author).toBe('vec')
    expect(parsed.article).toBe(valid_article)
  })

  it('拒绝过短的正文并给出中文提示', () => {
    const result = zQunCommentDraft.safeParse({ author: 'vec', article: '太短了' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const article_issues = result.error.issues.filter((issue) => issue.path[0] === 'article')
      expect(article_issues[article_issues.length - 1]?.message).toBe('不到20字就想装逼？呵呵')
    }
  })

  it('缺少名字时给出中文提示', () => {
    const result = zQunCommentDraft.safeParse({ author: '   ', article: valid_article })
    expect(result.success).toBe(false)
    if (!result.success) {
      const author_issues = result.error.issues.filter((issue) => issue.path[0] === 'author')
      expect(author_issues[author_issues.length - 1]?.message).toBe('你要输入名字才能提交。')
    }
  })

  it('拒绝过长的正文并给出上限提示', () => {
    const result = zQunCommentDraft.safeParse({
      author: 'vec',
      article: '一'.repeat(2001),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const article_issues = result.error.issues.filter((issue) => issue.path[0] === 'article')
      expect(article_issues[article_issues.length - 1]?.message).toBe('正文最多 2000 个字')
    }
  })

  it('拒绝过长的作者', () => {
    const result = zQunCommentDraft.safeParse({
      author: '一'.repeat(17),
      article: valid_article,
    })
    expect(result.success).toBe(false)
  })

  it('拒绝控制字符', () => {
    const result = zQunCommentDraft.safeParse({
      author: 'vec\u0001',
      article: valid_article,
    })
    expect(result.success).toBe(false)
  })

  it('会把 CRLF 归一成 LF', () => {
    const parsed = zQunCommentDraft.parse({
      author: 'vec',
      article: `第一行\r\n第二行${'填'.repeat(20)}`,
    })
    expect(parsed.article).toContain('\n')
    expect(parsed.article).not.toContain('\r')
  })

  it('创建输入需要正的 started_at 和足够长的 client_id', () => {
    const result = zQunCommentCreateInput.safeParse({
      author: 'vec',
      article: valid_article,
      turnstile_token: '',
      turnstile_unavailable: true,
      website: '',
      started_at: 1760000000000,
      client_id: 'q-abcdefgh',
    })
    expect(result.success).toBe(true)
  })
})
