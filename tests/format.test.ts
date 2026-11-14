import { describe, expect, it } from 'vitest'
import type { QunComment } from '../shared/schema'
import {
  qunCountCharacters,
  qunFormatCommentDate,
  qunFormatDateStamp,
  qunGroupCommentsByYear,
} from '../src/lib/format'

const comment = (id: number, created_at: string): QunComment => ({
  id: id as QunComment['id'],
  author: 'vec',
  article: '这是一条留言正文。',
  created_at,
})

describe('留言日期格式', () => {
  it('按 Asia/Shanghai 显示 2016 年的日期', () => {
    const date = qunFormatCommentDate('2016-10-04T20:56:03.000Z')
    expect(date.year).toBe('2016')
    expect(date.month_day).toBe('10.05')
    expect(date.time).toBe('04:56')
  })

  it('按 Asia/Shanghai 显示 2025 年的日期', () => {
    const date = qunFormatCommentDate('2025-04-27T21:17:46.000Z')
    expect(date.year).toBe('2025')
    expect(date.month_day).toBe('04.28')
    expect(date.time).toBe('05:17')
  })

  it('日期戳用点分隔', () => {
    expect(qunFormatDateStamp(new Date('2026-11-14T18:00:00.000Z'))).toBe('2026.11.15')
  })

  it('按年份分组且保持顺序', () => {
    const groups = qunGroupCommentsByYear([
      comment(3, '2025-04-27T21:17:46.000Z'),
      comment(2, '2016-10-05T09:41:31.000Z'),
      comment(1, '2016-10-04T20:56:03.000Z'),
    ])
    expect(groups.map((group) => group.year)).toEqual(['2025', '2016'])
    expect(groups[1]?.comments.map((item) => item.id)).toEqual([2, 1])
  })

  it('按 Unicode code point 计数', () => {
    expect(qunCountCharacters('😀a')).toBe(2)
  })
})
