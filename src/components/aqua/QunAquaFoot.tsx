import type { ReactElement } from 'react'
import { Link } from 'react-router'

export function QunAquaFoot(): ReactElement {
  return (
    <footer id="foot">
      © 2015-2026 Torzo Club. All Rights Reserved.
      <br />
      Best viewed at 1024×768
      <Link to="/admin" className="foot-admin">
        管理员入口
      </Link>
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
