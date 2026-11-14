import { type ReactElement, useEffect, useRef } from 'react'

type TurnstileProps = {
  readonly site_key: string
  readonly on_token: (token: string) => void
  readonly on_unavailable: () => void
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export function QunTurnstile({ site_key, on_token, on_unavailable }: TurnstileProps): ReactElement {
  const $container_ref = useRef<HTMLDivElement | null>(null)
  const $widget_id_ref = useRef<string | null>(null)
  const $on_token_ref = useRef(on_token)
  const $on_unavailable_ref = useRef(on_unavailable)

  useEffect(() => {
    $on_token_ref.current = on_token
    $on_unavailable_ref.current = on_unavailable
  }, [on_token, on_unavailable])

  useEffect(() => {
    if (site_key === '') {
      $on_unavailable_ref.current()
      return
    } else {
      let $is_cancelled = false
      const timeout_id = window.setTimeout(() => {
        if ($widget_id_ref.current === null) {
          $on_unavailable_ref.current()
        }
      }, 8000)

      const renderWidget = (): void => {
        if (!$is_cancelled) {
          const container = $container_ref.current
          const turnstile = window.turnstile
          if (container !== null && turnstile !== undefined) {
            $widget_id_ref.current = turnstile.render(container, {
              sitekey: site_key,
              theme: 'light',
              language: 'zh-cn',
              callback: (token) => {
                $on_token_ref.current(token)
              },
              'expired-callback': () => {
                $on_token_ref.current('')
              },
              'error-callback': () => {
                $on_unavailable_ref.current()
              },
            })
          }
        }
      }

      const existing_script = document.querySelector<HTMLScriptElement>(
        'script[data-qun-turnstile]',
      )
      if (existing_script !== null) {
        if (window.turnstile !== undefined) {
          renderWidget()
        } else {
          existing_script.addEventListener('load', renderWidget, { once: true })
        }
      } else {
        const script = document.createElement('script')
        script.src = TURNSTILE_SCRIPT
        script.async = true
        script.defer = true
        script.dataset.qunTurnstile = 'true'
        script.addEventListener('load', renderWidget, { once: true })
        script.addEventListener('error', () => {
          $on_unavailable_ref.current()
        })
        document.head.appendChild(script)
      }

      return () => {
        $is_cancelled = true
        window.clearTimeout(timeout_id)
        if ($widget_id_ref.current !== null && window.turnstile !== undefined) {
          window.turnstile.remove($widget_id_ref.current)
          $widget_id_ref.current = null
        }
      }
    }
  }, [site_key])

  return (
    <div className="qun-turnstile">
      <div ref={$container_ref} />
    </div>
  )
}
