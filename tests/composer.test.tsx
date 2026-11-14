import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QunCommentComposer } from '../src/components/QunCommentComposer'

afterEach(cleanup)

describe('留言表单', () => {
  it('点击同装会触发 on_submit', () => {
    const on_submit = vi.fn()
    render(
      <QunCommentComposer
        author="vec"
        article="这是一篇足够长的留言正文，用来测试表单提交。"
        field_errors={{}}
        is_submitting={false}
        submit_error={null}
        turnstile_site_key=""
        turnstile_reset_key={0}
        turnstile_unavailable={false}
        on_author_change={() => undefined}
        on_article_change={() => undefined}
        on_token_change={() => undefined}
        on_turnstile_unavailable={() => undefined}
        on_submit={on_submit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '同装' }))
    expect(on_submit).toHaveBeenCalledTimes(1)
  })

  it('会把输入变化传出去', () => {
    const on_article_change = vi.fn()
    const on_author_change = vi.fn()
    render(
      <QunCommentComposer
        author=""
        article=""
        field_errors={{}}
        is_submitting={false}
        submit_error={null}
        turnstile_site_key=""
        turnstile_reset_key={0}
        turnstile_unavailable={false}
        on_author_change={on_author_change}
        on_article_change={on_article_change}
        on_token_change={() => undefined}
        on_turnstile_unavailable={() => undefined}
        on_submit={() => undefined}
      />,
    )
    fireEvent.change(screen.getByLabelText('正文'), { target: { value: '新的正文' } })
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '新名字' } })
    expect(on_article_change).toHaveBeenCalledWith('新的正文')
    expect(on_author_change).toHaveBeenCalledWith('新名字')
  })
})
