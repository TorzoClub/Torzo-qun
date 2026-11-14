import type { ReactElement } from 'react'
import type { GuideChapter } from '../content/chapters'

type GuideChapterProps = {
  readonly chapter: GuideChapter
}

export function QunGuideChapter({ chapter }: GuideChapterProps): ReactElement {
  const ChapterBody = chapter.component
  return (
    <section id={chapter.id} className="qun-chapter" aria-labelledby={`${chapter.id}-title`}>
      <header className="qun-chapter-head">
        <p className="qun-chapter-index">
          <span className="qun-chapter-number">{chapter.number}</span>
          <span className="qun-chapter-rule" aria-hidden="true" />
        </p>
        <h2 id={`${chapter.id}-title`} className="qun-chapter-title">
          {chapter.title}
        </h2>
        <p className="qun-chapter-dek">{chapter.summary}</p>
      </header>
      <div className="qun-prose">
        <ChapterBody />
      </div>
      <a className="qun-chapter-back" href="#guide-toc">
        回到目录 <span aria-hidden="true">↑</span>
      </a>
    </section>
  )
}
