import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { QunLineArt } from './QunLineArt'

export function QunHero(): ReactElement {
  return (
    <section className="qun-hero" aria-labelledby="qun-hero-title">
      <QunLineArt />
      <div className="qun-hero-inner">
        <div className="qun-hero-copy">
          <p className="qun-eyebrow">
            <span className="qun-seal">同</span>
            TORZO CLUB · SINCE 2015
          </p>
          <h1 id="qun-hero-title" className="qun-hero-title">
            同装导册
          </h1>
          <p className="qun-hero-subtitle">共同装逼协会 · 一本关于同装的导册</p>
          <p className="qun-hero-text">
            这里记录同装会从 2015
            年至今的自我解释：我们是谁、怎么选群主、为什么禁言，以及那些被叫做“装逼”的时刻。
          </p>
          <div className="qun-hero-actions">
            <a href="#guide-toc" className="qun-button qun-button-primary">
              进入导册 <span aria-hidden="true">↓</span>
            </a>
            <Link to="/guestbook" className="qun-button qun-button-ghost">
              去留言板 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="qun-hero-mark">
          <img
            src="/images/torzo-logo-512.png"
            alt="同装会标志"
            width={512}
            height={512}
            fetchPriority="high"
          />
          <p className="qun-hero-mark-meta">
            同装会 · 共同装逼协会
            <br />
            EST. 2015
          </p>
        </div>
      </div>
      <p className="qun-hero-scroll" aria-hidden="true">
        SCROLL / 向下阅读
      </p>
    </section>
  )
}
