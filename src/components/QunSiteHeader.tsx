import type { ReactElement } from 'react'
import { Link } from 'react-router'

export type QunSiteHeaderVariant = 'guide' | 'guestbook' | 'admin'

type SiteHeaderProps = {
  readonly variant: QunSiteHeaderVariant
}

export function QunSiteHeader({ variant }: SiteHeaderProps): ReactElement {
  return (
    <header className="qun-header">
      <a className="qun-skip" href="#qun-main">
        跳到正文
      </a>
      <div className="qun-header-inner">
        <Link
          to="/"
          className="qun-brand"
          aria-label="同装导册首页"
          onClick={() => {
            window.scrollTo(0, 0)
          }}
        >
          <span className="qun-brand-seal" aria-hidden="true">
            同
          </span>
          <span className="qun-brand-text">同装导册</span>
        </Link>
        <nav className="qun-nav" aria-label="站点导航">
          {variant === 'guide' ? (
            <>
              <a href="#guide-toc" className="qun-nav-link">
                目录
              </a>
              <Link to="/guestbook" className="qun-nav-link qun-nav-link-strong">
                留言板
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="qun-nav-link">
                返回导册
              </Link>
              <Link to="/guestbook" className="qun-nav-link qun-nav-link-strong">
                留言板
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
