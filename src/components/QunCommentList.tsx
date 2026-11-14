import type { ReactElement } from 'react'
import type { QunComment } from '../../shared/schema'
import { qunGroupCommentsByYear } from '../lib/format'
import { QunCommentItem } from './QunCommentItem'
import { QunErrorNotice } from './QunErrorNotice'

type CommentListProps = {
  readonly comments: readonly QunComment[]
  readonly is_loading: boolean
  readonly load_error: string | null
  readonly on_retry: () => void
}

function CommentSkeleton(): ReactElement {
  return (
    <div className="qun-comment-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

export function QunCommentList({
  comments,
  is_loading,
  load_error,
  on_retry,
}: CommentListProps): ReactElement {
  if (is_loading && comments.length === 0) {
    return (
      <div className="qun-comments" role="status" aria-busy="true" aria-label="正在读取留言">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    )
  } else if (load_error !== null && comments.length === 0) {
    return <QunErrorNotice message={load_error} on_retry={on_retry} />
  } else if (comments.length === 0) {
    return <p className="qun-comments-empty">还没有人留言。来做第一个。</p>
  } else {
    const groups = qunGroupCommentsByYear(comments)
    return (
      <div className="qun-comments">
        {groups.map((group) => (
          <section
            key={group.year}
            className="qun-comment-year"
            aria-labelledby={`qun-year-${group.year}`}
          >
            <h2 id={`qun-year-${group.year}`} className="qun-comment-year-title">
              {group.year}
            </h2>
            <ol className="qun-comment-list">
              {group.comments.map((comment) => (
                <QunCommentItem key={comment.id} comment={comment} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    )
  }
}
