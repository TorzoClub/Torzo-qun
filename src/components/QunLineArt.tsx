import type { ReactElement } from 'react'

export function QunLineArt(): ReactElement {
  return (
    <svg
      className="qun-line-art"
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M260 28C409 28 490 138 490 260C490 382 409 492 260 492C111 492 30 382 30 260C30 138 111 28 260 28Z"
        pathLength={1}
      />
      <path d="M40 260H480" pathLength={1} />
      <path d="M260 40V480" pathLength={1} />
    </svg>
  )
}
