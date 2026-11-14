import { Fragment, type ReactElement, useEffect, useState } from 'react'
import { QunAquaAccordion } from '../components/aqua/QunAquaAccordion'
import { QunAquaCommentBoard } from '../components/aqua/QunAquaCommentBoard'
import { QunAquaFoot } from '../components/aqua/QunAquaFoot'
import { QunAquaMasthead } from '../components/aqua/QunAquaMasthead'
import { QunAquaSplash } from '../components/aqua/QunAquaSplash'
import { QunAquaTotop } from '../components/aqua/QunAquaTotop'
import { QunPageTitle } from '../components/QunPageTitle'
import { QUN_GUIDE_CHAPTERS } from '../content/chapters'

export function QunHomePage(): ReactElement {
  const [splash_run, setSplashRun] = useState(0)
  const [is_splash_visible, setIsSplashVisible] = useState(true)

  useEffect(() => {
    document.body.classList.add('splash')
    return () => {
      document.body.classList.remove('splash', 'entered')
    }
  }, [])

  function enter(): void {
    document.body.classList.remove('splash')
    document.body.classList.add('entered')
    setIsSplashVisible(false)
  }

  function replay(): void {
    document.body.classList.remove('entered')
    document.body.classList.add('splash')
    setIsSplashVisible(true)
    setSplashRun((current) => current + 1)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      <QunPageTitle title="同装导册 · 同装会 Torzo Club" />
      <main id="page">
        <QunAquaMasthead
          title="同装导册"
          subtitle="TORZO · 同装会"
          show_ticker
          on_replay={replay}
        />
        <div id="index">
          {QUN_GUIDE_CHAPTERS.map((chapter) => {
            const ChapterBody = chapter.component
            return (
              <Fragment key={chapter.id}>
                {chapter.id === 'about-web' ? <hr /> : null}
                <QunAquaAccordion id={chapter.id} title={chapter.title}>
                  <ChapterBody />
                </QunAquaAccordion>
              </Fragment>
            )
          })}
        </div>
        <QunAquaAccordion id="comment" title="留言板" badge={<span className="new">NEW!</span>}>
          <QunAquaCommentBoard />
        </QunAquaAccordion>
      </main>
      <QunAquaFoot />
      <QunAquaTotop />
      {is_splash_visible ? <QunAquaSplash key={splash_run} on_enter={enter} /> : null}
    </div>
  )
}
