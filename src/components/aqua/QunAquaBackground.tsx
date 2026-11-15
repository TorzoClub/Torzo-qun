import type { CSSProperties, ReactElement } from 'react'

type BubbleStyle = CSSProperties & {
  '--x': string
  '--s': string
  '--d': string
  '--sw': string
  '--dl': string
}

type QunAquaBubblesProps = {
  readonly count: number
  readonly from_bottom: boolean
}

function bubbleStyle(index: number, from_bottom: boolean): BubbleStyle {
  const duration = 96 + ((index * 11) % 16)
  const delay = from_bottom ? (index * 7) % 7 : -((index * 13) % duration)
  return {
    '--x': `${(index * 37 + 13) % 100}%`,
    '--s': `${10 + ((index * 17) % 56)}px`,
    '--d': `${duration}s`,
    '--sw': `${((index * 29) % 90) - 45}px`,
    '--dl': `${delay}s`,
  }
}

export function QunAquaBubbles({ count, from_bottom }: QunAquaBubblesProps): ReactElement {
  return (
    <div className="bubbles">
      {Array.from({ length: count }, (_, index) => {
        const bubble_id = `bubble-${index}`
        return <i key={bubble_id} style={bubbleStyle(index, from_bottom)} />
      })}
    </div>
  )
}

const RAY_INDEXES = [1, 2, 3, 4, 5, 6] as const

export function QunAquaBackground(): ReactElement {
  return (
    <div id="sea">
      <div className="sun-glow" />
      <svg className="water-filter" aria-hidden="true" focusable="false" width="0" height="0">
        <defs>
          <filter id="qun-water-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.018"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="26"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="rays">
        {RAY_INDEXES.map((index) => (
          <span key={index} className={`ray ray-${index}`} />
        ))}
      </div>
      <div className="caustics" />
      <div className="depth-haze" />
      <QunAquaBubbles count={18} from_bottom={false} />
    </div>
  )
}
