import type { MouseEvent, ReactElement } from 'react'

/**
 * 后台入口必须是一次真实的整页请求：
 * - react-router 的 <Link> 只做 history.pushState，不产生请求，Cloudflare Access 拦不到；
 * - 某些环境下原生 <a> 的默认跳转也可能被前端拦截，所以这里再显式赋 location.href，
 *   确保浏览器真的去请求 /admin（Access 会在边缘先跳登录页）。
 */
function enterAdmin(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault()
  window.location.href = '/admin'
}

export function QunAquaFoot(): ReactElement {
  return (
    <footer id="foot">
      © 2015-2026 Torzo Club. All Rights Reserved.
      <br />
      Best viewed at 1024×768
      <a className="foot-admin" href="/admin" title="管理员入口" onClick={enterAdmin}>
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
