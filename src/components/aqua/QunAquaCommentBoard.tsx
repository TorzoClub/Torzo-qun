import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import type { ZodError } from 'zod'
import {
  QUN_COMMENT_ARTICLE_MAX,
  QUN_COMMENT_ARTICLE_MIN,
  QUN_COMMENT_AUTHOR_MAX,
} from '../../../shared/constants'
import { type QunComment, zQunCommentDraft } from '../../../shared/schema'
import { qunCommentCreate, qunCommentsFetchPage } from '../../lib/api'
import { qunCreateClientID } from '../../lib/client-id'
import { qunCountCharacters, qunFormatCommentDate } from '../../lib/format'
import { QunTurnstile } from '../QunTurnstile'
import { QunSkeuomorphismButton } from './QunSkeuomorphismButton'

type LoadMode = 'replace' | 'append'

type StatusKind = 'loading' | 'error' | 'empty' | 'form-error' | null

function fieldErrorsFromZod(error: ZodError): Readonly<Record<string, string>> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      issue.path.length === 0 ? 'form' : issue.path.join('.'),
      issue.message,
    ]),
  )
}

export function QunAquaCommentBoard(): ReactElement {
  const [author, setAuthor] = useState('')
  const [article, setArticle] = useState('')
  const [field_errors, setFieldErrors] = useState<Readonly<Record<string, string>>>({})
  const [is_submitting, setIsSubmitting] = useState(false)
  const [form_error, setFormError] = useState<string | null>(null)
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
  const [today_iso, setTodayIso] = useState<string | null>(null)
  const $started_at_ref = useRef<number | null>(null)
  const $client_id_ref = useRef<string | null>(null)

  const turnstile_site_key = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''
  const today = today_iso === null ? null : qunFormatCommentDate(today_iso)

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
    setTodayIso(new Date().toISOString())
    void loadComments(1, 'replace')
  }, [loadComments])

  async function submitComment(): Promise<void> {
    const parsed = zQunCommentDraft.safeParse({ author, article })
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error))
      setFormError(null)
    } else {
      setFieldErrors({})
      setFormError(null)
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
      } else {
        setFormError(result.error.message)
        setFieldErrors(result.error.fields ?? {})
      }
      setIsSubmitting(false)
    }
  }

  const status_kind: StatusKind =
    form_error !== null
      ? 'form-error'
      : load_error !== null && comments.length === 0
        ? 'error'
        : is_loading && comments.length === 0
          ? 'loading'
          : comments.length === 0
            ? 'empty'
            : null

  const article_count = qunCountCharacters(article)
  const more_label = is_loading_more ? '载入中…' : has_more ? '▼ 载入更多留言' : '—— 没有更多了 ——'

  return (
    <div className="aqua-comment-board">
      <div id="editor-slot">
        <div className="post editor">
          <div className="time-area">
            <time>
              <span className="month">{today?.month ?? '--'}</span>
              <span className="day">{today?.day ?? '--'}</span>
              <span className="year">{today?.year ?? '----'}</span>
            </time>
          </div>
          <article>
            <textarea
              value={article}
              onChange={(event) => {
                setArticle(event.target.value)
                setFormError(null)
              }}
              placeholder="同装，轮到你了。"
              rows={7}
              maxLength={QUN_COMMENT_ARTICLE_MAX}
              aria-invalid={field_errors.article !== undefined}
            />
            <div className="editor-count">
              {article_count} / {QUN_COMMENT_ARTICLE_MAX}
              {article_count < QUN_COMMENT_ARTICLE_MIN
                ? `，还差 ${QUN_COMMENT_ARTICLE_MIN - article_count} 字`
                : ''}
            </div>
          </article>
          <div className="author-frame">
            <span className="from">From:</span>
            <span className="author">
              <input
                className="comment-author-input"
                value={author}
                onChange={(event) => {
                  setAuthor(event.target.value)
                  setFormError(null)
                }}
                placeholder="君の名は？"
                maxLength={QUN_COMMENT_AUTHOR_MAX}
                aria-label="你的名字"
                aria-invalid={field_errors.author !== undefined}
              />
            </span>
            <QunSkeuomorphismButton
              type="button"
              tone="aqua"
              onClick={() => {
                void submitComment()
              }}
              disabled={is_submitting}
              buttonProps={{ id: 'post' }}
            >
              {is_submitting ? '发射中…' : '同装'}
            </QunSkeuomorphismButton>
          </div>
        </div>
        {field_errors.article === undefined && field_errors.author === undefined ? null : (
          <div className="aqua-editor-errors">
            {field_errors.article === undefined ? null : <p>{field_errors.article}</p>}
            {field_errors.author === undefined ? null : <p>{field_errors.author}</p>}
          </div>
        )}
        <div className="turnstile-wrap">
          <QunTurnstile
            key={turnstile_reset_key}
            site_key={turnstile_site_key}
            on_token={(token) => {
              setTurnstileToken(token)
              if (token !== '') {
                setTurnstileUnavailable(false)
              }
            }}
            on_unavailable={() => {
              setTurnstileUnavailable(true)
            }}
          />
          {turnstile_unavailable ? (
            <p className="turnstile-note">人机验证没有加载出来；提交会使用更严格的频率限制。</p>
          ) : null}
        </div>
      </div>

      <div
        id="comment-status"
        className={status_kind === 'error' || status_kind === 'form-error' ? 'is-error' : ''}
        hidden={status_kind === null}
      >
        {status_kind === 'loading' ? (
          <>
            <span>留言读取中…（不影响浏览其他内容）</span>
            <div className="progress indet">
              <i />
            </div>
          </>
        ) : status_kind === 'error' ? (
          <>
            <span>⚠ 留言暂时连不上服务器。</span>
            <QunSkeuomorphismButton
              type="button"
              tone="aqua"
              buttonProps={{ id: 'retry' }}
              onClick={() => {
                void loadComments(1, 'replace')
              }}
            >
              重新连接
            </QunSkeuomorphismButton>
          </>
        ) : status_kind === 'empty' ? (
          <span>还没有人留言，快来抢沙发！</span>
        ) : status_kind === 'form-error' ? (
          <span>{form_error}</span>
        ) : null}
      </div>

      <ul id="comment-list">
        {comments.map((comment) => {
          const date = qunFormatCommentDate(comment.created_at)
          return (
            <li key={comment.id} className="post">
              <div className="time-area">
                <time>
                  <span className="month">{date.month}</span>
                  <span className="day">{date.day}</span>
                  <span className="year">{date.year}</span>
                </time>
              </div>
              <article>{comment.article}</article>
              <div className="author-frame">
                <span className="from">From:</span>
                <span className="author">{comment.author}</span>
              </div>
            </li>
          )
        })}
      </ul>

      <QunSkeuomorphismButton
        type="button"
        tone="aqua"
        inputProps={{ hidden: comments.length === 0 }}
        buttonProps={{ id: 'continue-load' }}
        disabled={is_loading_more || !has_more}
        onClick={() => {
          void loadComments(page + 1, 'append')
        }}
      >
        {more_label}
      </QunSkeuomorphismButton>
      <p className="sr-only" aria-live="polite">
        当前共 {total} 条留言
      </p>
    </div>
  )
}
