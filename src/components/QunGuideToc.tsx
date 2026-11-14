import type { ReactElement } from 'react'
import { QUN_GUIDE_CHAPTERS } from '../content/chapters'

export function QunGuideToc(): ReactElement {
  return (
    <section id="guide-toc" className="qun-toc-section" aria-labelledby="qun-toc-title">
      <div className="qun-section-head">
        <p className="qun-eyebrow">目录 / INDEX</p>
        <h2 id="qun-toc-title" className="qun-section-title">
          八章，慢慢读。
        </h2>
        <p className="qun-section-dek">从“关于”到“关于 WEB 版”，这是一份还没写完的自我说明。</p>
      </div>
      <ol className="qun-toc-cards">
        {QUN_GUIDE_CHAPTERS.map((chapter) => (
          <li key={chapter.id}>
            <a href={`#${chapter.id}`} className="qun-toc-card">
              <span className="qun-toc-number">{chapter.number}</span>
              <span className="qun-toc-card-body">
                <span className="qun-toc-card-title">{chapter.title}</span>
                <span className="qun-toc-card-summary">{chapter.summary}</span>
              </span>
              <span className="qun-toc-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
