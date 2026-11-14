import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QunApp } from './QunApp'

export function qunRenderPage(path: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <QunApp />
    </MemoryRouter>,
  )
}
