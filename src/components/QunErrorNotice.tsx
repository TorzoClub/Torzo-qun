import type { ReactElement } from 'react'

type ErrorNoticeProps = {
  readonly message: string
  readonly on_retry?: () => void
}

export function QunErrorNotice({ message, on_retry }: ErrorNoticeProps): ReactElement {
  return (
    <div className="qun-notice qun-notice-error" role="alert">
      <p>{message}</p>
      {on_retry === undefined ? null : (
        <button type="button" className="qun-button qun-button-small" onClick={on_retry}>
          再试一次
        </button>
      )}
    </div>
  )
}
