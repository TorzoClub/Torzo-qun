import { type ReactElement, useEffect, useState } from 'react'

export function QunAquaTotop(): ReactElement {
  const [is_visible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateVisible = (): void => {
      setIsVisible(window.scrollY > 400)
    }
    updateVisible()
    window.addEventListener('scroll', updateVisible, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateVisible)
    }
  }, [])

  return (
    <button
      id="totop"
      type="button"
      className={is_visible ? 'show' : ''}
      aria-label="回到顶部"
      title="回到顶部"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    />
  )
}
