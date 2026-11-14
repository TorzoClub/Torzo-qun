import type { ReactElement } from 'react'
import { Link } from 'react-router'

export function QunAquaFoot(): ReactElement {
  return (
    <footer id="foot">
      © 同装会 TORZO · 导册 WEB 版 · 内容禁止任何非官方形式的转载 · 代码禁止用于任何商业目的
      <br />
      Best viewed at 1024×768
      <Link to="/admin" className="foot-admin">
        管理员入口
      </Link>
    </footer>
  )
}
