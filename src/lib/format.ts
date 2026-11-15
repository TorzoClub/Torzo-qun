import { QUN_TIME_ZONE } from '../../shared/constants'
import type { QunComment } from '../../shared/schema'

export type QunCommentDateLabels = {
  readonly year: string
  readonly month: string
  readonly day: string
  readonly month_day: string
  readonly time: string
}

export type QunCommentYearGroup = {
  readonly year: string
  readonly comments: readonly QunComment[]
}

const date_stamp_formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: QUN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const comment_date_formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: QUN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function qunFormatCommentDate(iso: string): QunCommentDateLabels {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return {
      year: '—',
      month: '—',
      day: '—',
      month_day: '—.—',
      time: '—:—',
    }
  } else {
    const parts = comment_date_formatter.formatToParts(date)
    const findPart = (type: string): string => {
      return parts.find((part) => part.type === type)?.value ?? '—'
    }
    return {
      year: findPart('year'),
      month: findPart('month'),
      day: findPart('day'),
      month_day: `${findPart('month')}.${findPart('day')}`,
      time: `${findPart('hour')}:${findPart('minute')}`,
    }
  }
}

export function qunGroupCommentsByYear(
  comments: readonly QunComment[],
): readonly QunCommentYearGroup[] {
  const grouped = comments.reduce<Map<string, readonly QunComment[]>>((current, comment) => {
    const year = qunFormatCommentDate(comment.created_at).year
    const next = new Map(current)
    next.set(year, [...(current.get(year) ?? []), comment])
    return next
  }, new Map())
  return Array.from(grouped.entries()).map(([year, year_comments]) => ({
    year,
    comments: year_comments,
  }))
}

export function qunFormatDateStamp(date: Date): string {
  const parts = date_stamp_formatter.formatToParts(date)
  const findPart = (type: string): string => {
    return parts.find((part) => part.type === type)?.value ?? '—'
  }
  return `${findPart('year')}.${findPart('month')}.${findPart('day')}`
}

export function qunCountCharacters(value: string): number {
  return [...value].length
}
