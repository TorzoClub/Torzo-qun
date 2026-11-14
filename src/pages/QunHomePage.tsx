import { type ReactElement, useEffect, useState } from 'react'
import { QunGuestbookCta } from '../components/QunGuestbookCta'
import { QunGuideChapter } from '../components/QunGuideChapter'
import { QunGuideToc } from '../components/QunGuideToc'
import { QunHero } from '../components/QunHero'
import { QunSiteFooter } from '../components/QunSiteFooter'
import { QunSiteHeader } from '../components/QunSiteHeader'
import { QunTocRail } from '../components/QunTocRail'
import { QUN_GUIDE_CHAPTERS } from '../content/chapters'

export function QunHomePage(): ReactElement {
  const [active_id, setActiveId] = useState<string | null>(null)
  const [reading_progress, setReadingProgress] = useState(0)

  useEffect(() => {
    const elements = QUN_GUIDE_CHAPTERS.map((chapter) =>
      document.getElementById(chapter.id),
    ).filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((current) => current.isIntersecting)
        if (entry !== undefined) {
          setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-12% 0px -72% 0px' },
    )
    elements.forEach((element) => {
      observer.observe(element)
    })
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const updateProgress = (): void => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      setReadingProgress(progress)
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  return (
    <div className="qun-page">
      <div
        className="qun-progress"
        style={{ transform: `scaleX(${reading_progress})` }}
        aria-hidden="true"
      />
      <QunSiteHeader variant="guide" />
      <main id="qun-main">
        <QunHero />
        <QunGuideToc />
        <div className="qun-guide-layout">
          <QunTocRail active_id={active_id} />
          <div className="qun-guide-chapters">
            {QUN_GUIDE_CHAPTERS.map((chapter) => (
              <QunGuideChapter key={chapter.id} chapter={chapter} />
            ))}
            <QunGuestbookCta />
          </div>
        </div>
      </main>
      <QunSiteFooter />
    </div>
  )
}
