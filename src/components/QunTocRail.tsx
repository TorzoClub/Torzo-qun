import type { ReactElement } from 'react'
import { QUN_GUIDE_CHAPTERS } from '../content/chapters'

type TocRailProps = {
  readonly active_id: string | null
}

export function QunTocRail({ active_id }: TocRailProps): ReactElement {
  return (
    <aside className="qun-toc-rail" aria-label="章节目录">
      <p className="qun-toc-rail-title">目录</p>
      <nav aria-label="章节导航">
        <ol>
          {QUN_GUIDE_CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={
                  chapter.id === active_id ? 'qun-toc-rail-link is-active' : 'qun-toc-rail-link'
                }
                aria-current={chapter.id === active_id ? 'location' : undefined}
              >
                <span>{chapter.number}</span>
                {chapter.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <a className="qun-toc-rail-top" href="#qun-hero-title">
        回到顶部 ↑
      </a>
    </aside>
  )
}
