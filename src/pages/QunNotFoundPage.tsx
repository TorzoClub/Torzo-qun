import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { QunAquaFoot } from '../components/aqua/QunAquaFoot'
import { QunAquaMasthead } from '../components/aqua/QunAquaMasthead'
import { QunAquaTotop } from '../components/aqua/QunAquaTotop'
import { QunPageTitle } from '../components/QunPageTitle'

export function QunNotFoundPage(): ReactElement {
  return (
    <div>
      <QunPageTitle title="页面不存在 · 同装导册" />
      <main id="page">
        <QunAquaMasthead title="404" subtitle="NOT FOUND · 同装会" />
        <p className="aqua-back">
          <Link to="/">← 返回导册</Link>
        </p>
        <div className="aqua-panel aqua-404">
          <h2 className="aqua-panel-title">这一页不在导册里。</h2>
          <p>可能是链接旧了，或者只是走错了一扇门。</p>
          <Link to="/" className="aqua-button aqua-button-strong">
            回到导册
          </Link>
        </div>
      </main>
      <QunAquaFoot />
      <QunAquaTotop />
    </div>
  )
}
