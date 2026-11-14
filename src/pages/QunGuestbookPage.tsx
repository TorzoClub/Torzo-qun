import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import type { ZodError } from 'zod'
import { type QunComment, zQunCommentDraft } from '../../shared/schema'
import { QunCommentComposer } from '../components/QunCommentComposer'
import { QunCommentList } from '../components/QunCommentList'
import { QunErrorNotice } from '../components/QunErrorNotice'
import { QunPageTitle } from '../components/QunPageTitle'
import { QunSiteFooter } from '../components/QunSiteFooter'
import { QunSiteHeader } from '../components/QunSiteHeader'
import { qunCommentCreate, qunCommentsFetchPage } from '../lib/api'
import { qunCreateClientID } from '../lib/client-id'

type LoadMode = 'replace' | 'append'

type LoadMoreControlProps = {
  readonly has_more: boolean
  readonly comments_count: number
  readonly is_loading_more: boolean
  readonly on_load_more: () => void
}

function LoadMoreControl({
  has_more,
  comments_count,
  is_loading_more,
  on_load_more,
}: LoadMoreControlProps): ReactElement | null {
  if (has_more) {
    return (
      <div className="qun-load-more">
        <button
          type="button"
          className="qun-button qun-button-ghost qun-load-more-button"
          onClick={on_load_more}
          disabled={is_loading_more}
        >
          {is_loading_more ? '读取中…' : '载入更多'}
        </button>
      </div>
    )
  } else if (comments_count > 0) {
    return <p className="qun-list-end">—— 到底了 ——</p>
  } else {
    return null
  }
}

function fieldErrorsFromZod(error: ZodError): Readonly<Record<string, string>> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      issue.path.length === 0 ? 'form' : issue.path.join('.'),
      issue.message,
    ]),
  )
}

export function QunGuestbookPage(): ReactElement {
  const [author, setAuthor] = useState('')
  const [article, setArticle] = useState('')
  const [field_errors, setFieldErrors] = useState<Readonly<Record<string, string>>>({})
  const [is_submitting, setIsSubmitting] = useState(false)
  const [submit_error, setSubmitError] = useState<string | null>(null)
  const [status_message, setStatusMessage] = useState<string | null>(null)
  const [comments, setComments] = useState<readonly QunComment[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [has_more, setHasMore] = useState(false)
  const [is_loading, setIsLoading] = useState(true)
  const [is_loading_more, setIsLoadingMore] = useState(false)
  const [load_error, setLoadError] = useState<string | null>(null)
  const [turnstile_token, setTurnstileToken] = useState('')
  const [turnstile_unavailable, setTurnstileUnavailable] = useState(false)
  const [turnstile_reset_key, setTurnstileResetKey] = useState(0)
  const $started_at_ref = useRef<number | null>(null)
  const $client_id_ref = useRef<string | null>(null)

  const turnstile_site_key = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

  const loadComments = useCallback(async (next_page: number, mode: LoadMode): Promise<void> => {
    if (mode === 'replace') {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setLoadError(null)
    const result = await qunCommentsFetchPage(next_page)
    if (result.ok) {
      if (mode === 'replace') {
        setComments(result.data.items)
      } else {
        setComments((current) => {
          const existing_ids = new Set(current.map((comment) => comment.id))
          const new_items = result.data.items.filter((comment) => !existing_ids.has(comment.id))
          return [...current, ...new_items]
        })
      }
      setPage(result.data.page)
      setTotal(result.data.total)
      setHasMore(result.data.has_more)
    } else {
      setLoadError(result.error.message)
    }
    if (mode === 'replace') {
      setIsLoading(false)
    } else {
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    $started_at_ref.current = Date.now()
    $client_id_ref.current = qunCreateClientID(Date.now(), Math.random())
    void loadComments(1, 'replace')
  }, [loadComments])

  async function submitComment(): Promise<void> {
    const parsed = zQunCommentDraft.safeParse({ author, article })
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error))
    } else {
      setFieldErrors({})
      setSubmitError(null)
      setStatusMessage(null)
      setIsSubmitting(true)
      const result = await qunCommentCreate({
        ...parsed.data,
        turnstile_token,
        turnstile_unavailable,
        website: '',
        started_at: $started_at_ref.current ?? Date.now(),
        client_id: $client_id_ref.current ?? qunCreateClientID(Date.now(), Math.random()),
      })
      if (result.ok) {
        setComments((current) => [result.data, ...current])
        setTotal((current) => current + 1)
        setAuthor('')
        setArticle('')
        setTurnstileToken('')
        setTurnstileResetKey((current) => current + 1)
        $client_id_ref.current = qunCreateClientID(Date.now(), Math.random())
        setStatusMessage('已同装。')
      } else {
        setSubmitError(result.error.message)
        setFieldErrors(result.error.fields ?? {})
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="qun-page">
      <QunPageTitle title="留言板 · 同装导册" />
      <QunSiteHeader variant="guestbook" />
      <main id="qun-main" className="qun-guestbook">
        <header className="qun-guestbook-head">
          <p className="qun-eyebrow">GUESTBOOK / 留言板</p>
          <h1 className="qun-guestbook-title">留言板</h1>
          <p className="qun-guestbook-dek">
            九年来，来过的人留下的话。这里不追热点，只留一点回声。
          </p>
          <p className="qun-guestbook-count">
            {is_loading && comments.length === 0 ? '正在读取…' : `共 ${total} 条留言`}
          </p>
        </header>

        <QunCommentComposer
          author={author}
          article={article}
          field_errors={field_errors}
          is_submitting={is_submitting}
          submit_error={submit_error}
          turnstile_site_key={turnstile_site_key}
          turnstile_reset_key={turnstile_reset_key}
          turnstile_unavailable={turnstile_unavailable}
          on_author_change={setAuthor}
          on_article_change={setArticle}
          on_token_change={(token) => {
            setTurnstileToken(token)
            if (token !== '') {
              setTurnstileUnavailable(false)
            }
          }}
          on_turnstile_unavailable={() => {
            setTurnstileUnavailable(true)
          }}
          on_submit={() => {
            void submitComment()
          }}
        />

        {status_message === null ? null : (
          <p className="qun-status" role="status">
            {status_message}
          </p>
        )}

        {load_error !== null && comments.length > 0 ? (
          <QunErrorNotice
            message={load_error}
            on_retry={() => {
              void loadComments(page + 1, 'append')
            }}
          />
        ) : null}

        <QunCommentList
          comments={comments}
          is_loading={is_loading}
          load_error={load_error}
          on_retry={() => {
            void loadComments(1, 'replace')
          }}
        />

        <LoadMoreControl
          has_more={has_more}
          comments_count={comments.length}
          is_loading_more={is_loading_more}
          on_load_more={() => {
            void loadComments(page + 1, 'append')
          }}
        />
      </main>
      <QunSiteFooter />
    </div>
  )
}
