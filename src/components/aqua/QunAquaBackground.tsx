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
  const duration = 12 + ((index * 11) % 16)
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

export function QunAquaBackground(): ReactElement {
  return (
    <div id="sea">
      <div className="rays" />
      <QunAquaBubbles count={18} from_bottom={false} />
    </div>
  )
}
