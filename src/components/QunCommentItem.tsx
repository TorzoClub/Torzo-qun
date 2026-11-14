import type { ReactElement } from 'react'
import type { QunComment } from '../../shared/schema'
import { qunFormatCommentDate } from '../lib/format'

type CommentItemProps = {
  readonly comment: QunComment
}

export function QunCommentItem({ comment }: CommentItemProps): ReactElement {
  const date = qunFormatCommentDate(comment.created_at)
  return (
    <li className="qun-comment">
      <div className="qun-comment-date">
        <time dateTime={comment.created_at} className="qun-comment-time">
          <span className="qun-comment-year-label">{date.year}</span>
          <span className="qun-comment-month-day">{date.month_day}</span>
          <span className="qun-comment-clock">{date.time}</span>
        </time>
      </div>
      <div className="qun-comment-main">
        <p className="qun-comment-article">{comment.article}</p>
        <div className="qun-comment-author">
          <img
            src="/images/from-256.png"
            alt=""
            width={64}
            height={27}
            className="qun-from-image"
          />
          <span className="qun-comment-author-name">{comment.author}</span>
        </div>
      </div>
    </li>
  )
}
