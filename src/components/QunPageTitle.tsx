import { type ReactElement, useEffect } from 'react'

type PageTitleProps = {
  readonly title: string
}

export function QunPageTitle({ title }: PageTitleProps): ReactElement | null {
  useEffect(() => {
    document.title = title
  }, [title])
  return null
}
