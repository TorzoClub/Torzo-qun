import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { QunPageTitle } from '../components/QunPageTitle'
import { QunSiteFooter } from '../components/QunSiteFooter'
import { QunSiteHeader } from '../components/QunSiteHeader'

export function QunNotFoundPage(): ReactElement {
  return (
    <div className="qun-page">
      <QunPageTitle title="页面不存在 · 同装导册" />
      <QunSiteHeader variant="admin" />
      <main id="qun-main" className="qun-not-found">
        <p className="qun-eyebrow">404 / NOT FOUND</p>
        <h1 className="qun-not-found-title">这一页不在导册里。</h1>
        <p className="qun-not-found-text">可能是链接旧了，或者只是走错了一扇门。</p>
        <Link to="/" className="qun-button qun-button-primary">
          回到导册 <span aria-hidden="true">→</span>
        </Link>
      </main>
      <QunSiteFooter />
    </div>
  )
}
