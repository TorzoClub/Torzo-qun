import type { ReactElement } from 'react'

type QunAquaMastheadProps = {
  readonly title: string
  readonly subtitle: string
  readonly on_replay?: () => void
}

export function QunAquaMasthead({
  title,
  subtitle,
  on_replay,
}: QunAquaMastheadProps): ReactElement {
  const mark_image = (
    <img src="/images/torzo-logo-256.png" alt="同装会标志" width={82} height={82} />
  )
  return (
    <header id="masthead">
      {on_replay === undefined ? (
        <div className="mark" id="mark" title="同装会">
          {mark_image}
        </div>
      ) : (
        <button
          type="button"
          className="mark"
          id="mark"
          title="点击重播开场动画"
          aria-label="点击重播开场动画"
          onClick={on_replay}
        >
          {mark_image}
        </button>
      )}
      <h1 className="site">{title}</h1>
      <div className="site-sub">{subtitle}</div>
    </header>
  )
}
