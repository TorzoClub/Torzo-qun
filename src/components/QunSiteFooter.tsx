import type { ReactElement } from 'react'

export function QunSiteFooter(): ReactElement {
  return (
    <footer className="qun-footer">
      <div className="qun-footer-inner">
        <div>
          <p className="qun-footer-brand">同装会 · Torzo Club</p>
          <p className="qun-footer-meta">2015—2026 · 同装导册 WEB 版</p>
        </div>
        <nav className="qun-footer-links" aria-label="页脚链接">
          <a href="https://weibo.com/torzo" target="_blank" rel="noopener noreferrer">
            微博
          </a>
          <a href="/torzo-manual.pdf">PDF 导册</a>
          <a
            href="https://github.com/TorzoClub/Torzo-qun"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <span className="qun-footer-dead">
            同装问卷站 <del className="qun-dead-link">[失效链接]</del>
          </span>
        </nav>
      </div>
    </footer>
  )
}
