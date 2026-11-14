import type { ReactElement } from 'react'
import { Link } from 'react-router'

export function QunGuestbookCta(): ReactElement {
  return (
    <section id="comment" className="qun-guestbook-cta" aria-labelledby="qun-guestbook-cta-title">
      <p className="qun-eyebrow">GUESTBOOK / 留言板</p>
      <h2 id="qun-guestbook-cta-title" className="qun-guestbook-cta-title">
        来过的人，留下的话。
      </h2>
      <p className="qun-guestbook-cta-text">
        从 2016 年到现在，留言板一直是一个不太热闹、但偶尔会有人回来看看的地方。
      </p>
      <Link to="/guestbook" className="qun-button qun-button-primary">
        去留言板 <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
