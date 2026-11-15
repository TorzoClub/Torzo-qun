import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QunApp } from './QunApp'

window.addEventListener('error', (event) => {
  console.error('unhandled browser error', event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('unhandled promise rejection', event.reason)
})

const root_element = document.getElementById('root')

if (root_element === null) {
  throw new Error('找不到 #root 挂载点')
} else {
  const application = (
    <StrictMode>
      <BrowserRouter>
        <QunApp />
      </BrowserRouter>
    </StrictMode>
  )
  if (root_element.hasChildNodes()) {
    hydrateRoot(root_element, application)
  } else {
    createRoot(root_element).render(application)
  }
}
