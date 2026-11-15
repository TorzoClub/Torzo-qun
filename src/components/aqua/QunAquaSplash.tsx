import {
  type CSSProperties,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

type SplashLetterStyle = CSSProperties & {
  '--k': number
}

type QunAquaSplashProps = {
  readonly on_enter: () => void
}

const SPLASH_MIN_MS = 4000
const SPLASH_LEAVE_MS = 2000
const SPLASH_CHARS = ['同', '装', '导', '册'] as const
const RIPPLE_INDEXES = [0] as const

export function QunAquaSplash({ on_enter }: QunAquaSplashProps): ReactElement {
  const [is_ready, setIsReady] = useState(false)
  const [is_leaving, setIsLeaving] = useState(false)
  const $leave_timer_ref = useRef<number | null>(null)

  useEffect(() => {
    const reduced_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(
      () => {
        setIsReady(true)
      },
      reduced_motion ? 0 : SPLASH_MIN_MS,
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const enter = useCallback((): void => {
    if (!is_ready || is_leaving) {
      return
    } else {
      setIsLeaving(true)
      $leave_timer_ref.current = window.setTimeout(() => {
        on_enter()
      }, SPLASH_LEAVE_MS)
    }
  }, [is_ready, is_leaving, on_enter])

  useEffect(() => {
    return () => {
      if ($leave_timer_ref.current !== null) {
        window.clearTimeout($leave_timer_ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!is_ready) {
      return
    } else {
      const handleKey = (event: KeyboardEvent): void => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          enter()
        }
      }
      window.addEventListener('keydown', handleKey)
      return () => {
        window.removeEventListener('keydown', handleKey)
      }
    }
  }, [enter, is_ready])

  const cover_class = `cover${is_ready ? ' ready' : ''}${is_leaving ? ' leaving' : ''}`

  return (
    // biome-ignore lint/a11y/useSemanticElements: 全屏开场包含块级内容，不能包成 button
    <div
      id="cover"
      className={cover_class}
      role="button"
      tabIndex={0}
      aria-label="进入同装导册"
      onClick={enter}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          enter()
        }
      }}
    >
      <div className="depth" />
      <div className="stage">
        <div className="orb-wrap">
          {RIPPLE_INDEXES.map((index) => {
            const style: SplashLetterStyle = { '--k': index }
            return <div key={index} className="ripple" style={style} />
          })}
          <div className="orb">
            <img src="/images/torzo-logo-256.png" alt="" width={112} height={112} />
          </div>
        </div>
        <h2 className="name">
          {SPLASH_CHARS.map((character, index) => {
            const style: SplashLetterStyle = { '--k': index }
            return (
              <span key={character} style={style}>
                {character}
              </span>
            )
          })}
        </h2>
        <div className="sub">TORZO · 20151005</div>
        <div
          style={{
            opacity: is_ready ? 1 : 0,
            transition: 'opacity 1618ms',
          }}
        >
          <p id="enter-tip">点击任意区域进入</p>
        </div>
      </div>
    </div>
  )
}
