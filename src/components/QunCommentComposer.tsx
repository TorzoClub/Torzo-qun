import { type FormEvent, type ReactElement, useEffect, useState } from 'react'
import {
  QUN_COMMENT_ARTICLE_MAX,
  QUN_COMMENT_ARTICLE_MIN,
  QUN_COMMENT_AUTHOR_MAX,
} from '../../shared/constants'
import { qunCountCharacters, qunFormatDateStamp } from '../lib/format'
import { QunTurnstile } from './QunTurnstile'

type CommentComposerProps = {
  readonly author: string
  readonly article: string
  readonly field_errors: Readonly<Record<string, string>>
  readonly is_submitting: boolean
  readonly submit_error: string | null
  readonly turnstile_site_key: string
  readonly turnstile_reset_key: number
  readonly turnstile_unavailable: boolean
  readonly on_author_change: (value: string) => void
  readonly on_article_change: (value: string) => void
  readonly on_token_change: (token: string) => void
  readonly on_turnstile_unavailable: () => void
  readonly on_submit: () => void
}

function TodayStamp(): ReactElement {
  const [date_label, setDateLabel] = useState('—')
  useEffect(() => {
    setDateLabel(qunFormatDateStamp(new Date()))
  }, [])
  return (
    <div className="qun-composer-date" aria-hidden="true">
      <span className="qun-composer-date-label">今天</span>
      <strong>{date_label}</strong>
      <span className="qun-composer-date-mark">NEW</span>
    </div>
  )
}

export function QunCommentComposer({
  author,
  article,
  field_errors,
  is_submitting,
  submit_error,
  turnstile_site_key,
  turnstile_reset_key,
  turnstile_unavailable,
  on_author_change,
  on_article_change,
  on_token_change,
  on_turnstile_unavailable,
  on_submit,
}: CommentComposerProps): ReactElement {
  const article_length = qunCountCharacters(article)
  const author_length = qunCountCharacters(author)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    on_submit()
  }

  return (
    <form className="qun-composer" onSubmit={handleSubmit} noValidate>
      <TodayStamp />
      <div className="qun-composer-main">
        <div className="qun-field">
          <label className="qun-label" htmlFor="qun-comment-article">
            正文
          </label>
          <textarea
            id="qun-comment-article"
            className="qun-textarea"
            name="article"
            value={article}
            onChange={(event) => {
              on_article_change(event.target.value)
            }}
            placeholder="同装，轮到你了。至少二十个字。"
            rows={7}
            maxLength={QUN_COMMENT_ARTICLE_MAX}
            aria-invalid={field_errors.article !== undefined}
            aria-describedby={field_errors.article === undefined ? undefined : 'qun-article-error'}
          />
          <div className="qun-field-foot">
            <span className={article_length < QUN_COMMENT_ARTICLE_MIN ? 'is-warn' : ''}>
              {article_length} / {QUN_COMMENT_ARTICLE_MAX}
              {article_length < QUN_COMMENT_ARTICLE_MIN
                ? `，还差 ${QUN_COMMENT_ARTICLE_MIN - article_length} 字`
                : ''}
            </span>
            {field_errors.article === undefined ? null : (
              <span id="qun-article-error" className="qun-field-error">
                {field_errors.article}
              </span>
            )}
          </div>
        </div>

        <div className="qun-composer-bottom">
          <div className="qun-field qun-field-author">
            <label className="qun-label" htmlFor="qun-comment-author">
              From
            </label>
            <div className="qun-author-input">
              <img
                src="/images/from-256.png"
                alt=""
                width={64}
                height={27}
                className="qun-from-image"
              />
              <input
                id="qun-comment-author"
                className="qun-input"
                name="author"
                value={author}
                onChange={(event) => {
                  on_author_change(event.target.value)
                }}
                placeholder="你的名字？"
                maxLength={QUN_COMMENT_AUTHOR_MAX}
                aria-invalid={field_errors.author !== undefined}
                aria-describedby={
                  field_errors.author === undefined ? undefined : 'qun-author-error'
                }
              />
            </div>
            <div className="qun-field-foot">
              <span>
                {author_length} / {QUN_COMMENT_AUTHOR_MAX}
              </span>
              {field_errors.author === undefined ? null : (
                <span id="qun-author-error" className="qun-field-error">
                  {field_errors.author}
                </span>
              )}
            </div>
          </div>

          <div className="qun-composer-actions">
            <QunTurnstile
              key={turnstile_reset_key}
              site_key={turnstile_site_key}
              on_token={on_token_change}
              on_unavailable={on_turnstile_unavailable}
            />
            {turnstile_unavailable ? (
              <p className="qun-field-note">人机验证没有加载出来；提交会使用更严格的频率限制。</p>
            ) : null}
            <button
              type="submit"
              className="qun-button qun-button-primary qun-submit"
              disabled={is_submitting}
            >
              {is_submitting ? '发射中…' : '同装'}
            </button>
          </div>
        </div>

        {submit_error === null ? null : (
          <p className="qun-notice qun-notice-error" role="alert">
            {submit_error}
          </p>
        )}
      </div>
    </form>
  )
}
