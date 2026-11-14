import { type ReactElement, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { QunAdminPage } from './pages/QunAdminPage'
import { QunGuestbookPage } from './pages/QunGuestbookPage'
import { QunHomePage } from './pages/QunHomePage'
import { QunNotFoundPage } from './pages/QunNotFoundPage'

function ScrollToTop(): null {
  const { pathname, hash } = useLocation()
  // biome-ignore lint/correctness/useExhaustiveDependencies: 路由变化时也要回到顶部
  useEffect(() => {
    if (hash === '') {
      window.scrollTo(0, 0)
    } else {
      const element = document.getElementById(hash.slice(1))
      if (element !== null) {
        element.scrollIntoView()
      } else {
        window.scrollTo(0, 0)
      }
    }
  }, [pathname, hash])
  return null
}

export function QunApp(): ReactElement {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<QunHomePage />} />
        <Route path="/guestbook" element={<QunGuestbookPage />} />
        <Route path="/admin" element={<QunAdminPage />} />
        <Route path="*" element={<QunNotFoundPage />} />
      </Routes>
    </>
  )
}
