import type { ReactElement } from 'react'

export function QunAquaFoot(): ReactElement {
  return (
    <footer id="foot">
      © 2015-2026 Torzo Club. All Rights Reserved.
      <br />
      Best viewed at 1024×768
      {/* 这里刻意用原生 <a> 而不是 react-router 的 Link：Link 走 HTML5 History，
          不会发出真正的页面请求，Cloudflare Access 就拦不到 /admin；用 <a> 触发整页导航，
          刷新或直达 /admin 时也会命中 prerender 出来的 admin.html。 */}
      <a className="foot-admin" href="/admin" title="管理员入口">
        管理员入口
      </a>
      <span className="foot-sep" aria-hidden="true">
        {' · '}
      </span>
      <a
        href="/legacy/"
        className="foot-classic"
        target="_blank"
        rel="noopener noreferrer"
        title="同装导册 2016 旧版（只读存档）"
      >
        旧版导册
      </a>
    </footer>
  )
}
