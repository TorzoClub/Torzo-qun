import type { ReactElement } from 'react'

type QunAquaMastheadProps = {
  readonly title: string
  readonly subtitle: string
  readonly show_ticker?: boolean
  readonly on_replay?: () => void
}

const TICKER_TEXT =
  '★ 欢迎光临「同装导册」 ★ 嘤其鸣矣，求其友声 ★ 来者不拒，去者不留 ★ 莫嘲人短，勿炫己长 ★ 百装同为先 ★'

export function QunAquaMasthead({
  title,
  subtitle,
  show_ticker = false,
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
      {show_ticker ? (
        <div className="ticker">
          <span>{TICKER_TEXT}</span>
          <span aria-hidden="true">{TICKER_TEXT}</span>
        </div>
      ) : null}
    </header>
  )
}
