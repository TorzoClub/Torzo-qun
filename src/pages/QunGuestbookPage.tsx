import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { QunAquaCommentBoard } from '../components/aqua/QunAquaCommentBoard'
import { QunAquaFoot } from '../components/aqua/QunAquaFoot'
import { QunAquaMasthead } from '../components/aqua/QunAquaMasthead'
import { QunAquaTotop } from '../components/aqua/QunAquaTotop'
import { QunPageTitle } from '../components/QunPageTitle'

export function QunGuestbookPage(): ReactElement {
  return (
    <div>
      <QunPageTitle title="留言板 · 同装导册" />
      <main id="page">
        <QunAquaMasthead title="留言板" subtitle="GUESTBOOK · 同装会" />
        <p className="aqua-back">
          <Link to="/">← 返回导册</Link>
        </p>
        <div id="comment" className="aqua-panel">
          <h2 className="aqua-panel-title">留言板</h2>
          <QunAquaCommentBoard />
        </div>
      </main>
      <QunAquaFoot />
      <QunAquaTotop />
    </div>
  )
}
