import { type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'

type QunAquaAccordionProps = {
  readonly id: string
  readonly title: string
  readonly badge?: ReactNode
  readonly default_open?: boolean
  readonly open_on_hash?: boolean
  readonly children: ReactNode
}

export function QunAquaAccordion({
  id,
  title,
  badge,
  default_open = false,
  open_on_hash = true,
  children,
}: QunAquaAccordionProps): ReactElement {
  const [is_open, setIsOpen] = useState(default_open)
  const $box_ref = useRef<HTMLDivElement | null>(null)
  const $timer_ref = useRef<number | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (open_on_hash && location.hash === `#${id}`) {
      setIsOpen(true)
    }
  }, [id, location.hash, open_on_hash])

  useEffect(() => {
    const box = $box_ref.current
    if (box === null) {
      return
    } else {
      if ($timer_ref.current !== null) {
        window.clearTimeout($timer_ref.current)
        $timer_ref.current = null
      }
      if (is_open) {
        const scroll_height = box.scrollHeight
        if (scroll_height === 0) {
          // 页面在开场期间被 display:none 隐藏时量不到高度；
          // 直接设为 auto，等页面可见后内容自然撑开，避免默认展开的留言板被裁成 0。
          box.style.height = 'auto'
        } else {
          box.style.height = `${scroll_height}px`
          $timer_ref.current = window.setTimeout(() => {
            box.style.height = 'auto'
          }, 400)
        }
      } else {
        box.style.height = `${box.scrollHeight}px`
        void box.offsetHeight
        box.style.height = '0px'
      }
      return () => {
        if ($timer_ref.current !== null) {
          window.clearTimeout($timer_ref.current)
          $timer_ref.current = null
        }
      }
    }
  }, [is_open])

  return (
    <section id={id} className={is_open ? 'article-item open' : 'article-item'}>
      <h2 className="item-heading">
        <button
          type="button"
          className="item-title"
          aria-expanded={is_open}
          aria-controls={`${id}-body`}
          onClick={() => {
            setIsOpen((current) => !current)
          }}
        >
          {title}
          {badge}
          <div className="expand-button">
            <div className="inner"></div>
          </div>
        </button>
      </h2>
      <div id={`${id}-body`} className="item-hide" ref={$box_ref} aria-hidden={!is_open}>
        <article>{children}</article>
      </div>
    </section>
  )
}
