type QunTurnstileRenderOptions = {
  sitekey: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

type QunTurnstileApi = {
  render: (container: HTMLElement, options: QunTurnstileRenderOptions) => string
  remove: (widget_id: string) => void
  reset: (widget_id: string) => void
}

declare global {
  interface Window {
    turnstile?: QunTurnstileApi
  }
}

export {}
