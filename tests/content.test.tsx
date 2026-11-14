import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { QUN_GUIDE_CHAPTERS } from '../src/content/chapters'

function chapterMarkup(chapter_id: string): string {
  const chapter = QUN_GUIDE_CHAPTERS.find((item) => item.id === chapter_id)
  if (chapter === undefined) {
    throw new Error(`missing chapter ${chapter_id}`)
  } else {
    const ChapterBody = chapter.component
    return renderToStaticMarkup(<ChapterBody />)
  }
}

describe('导册内容', () => {
  it('八个章节的 id 唯一', () => {
    expect(QUN_GUIDE_CHAPTERS).toHaveLength(8)
    expect(new Set(QUN_GUIDE_CHAPTERS.map((chapter) => chapter.id)).size).toBe(8)
  })

  it('关于保留关键段落', () => {
    const markup = chapterMarkup('about')
    expect(markup).toContain('共同装逼协会')
    expect(markup).toContain('尼采')
    expect(markup).toContain('爱因斯坦')
    expect(markup).toContain('weibo.com/torzo')
  })

  it('访谈录保留同装精神与七大装素', () => {
    const markup = chapterMarkup('torzo-qa')
    expect(markup).toContain('同装精神')
    expect(markup).toContain('格三去')
    expect(markup).toContain('同开独绽异强俗')
    expect(markup).toContain('Torzo')
  })

  it('分支页把失效链接渲染为删除线标记', () => {
    const markup = chapterMarkup('other-qun')
    expect(markup).toContain('qun-dead-link')
    expect(markup).toContain('[失效链接]')
    expect(markup).toContain('vec@torzo.club')
  })

  it('换届记录保留四届与关键名字', () => {
    const markup = chapterMarkup('manager-history')
    expect(markup).toContain('第壹届')
    expect(markup).toContain('第贰届')
    expect(markup).toContain('第叁届')
    expect(markup).toContain('第肆届')
    expect(markup).toContain('NT³')
    expect(markup).toContain('李清羽')
    expect(markup).toContain('云芝新')
  })

  it('关于 WEB 版保留 PDF 链接与两位当事人', () => {
    const markup = chapterMarkup('about-web')
    expect(markup).toContain('/torzo-manual.pdf')
    expect(markup).toContain('id="showtime"')
    expect(markup).toContain('id="vec"')
    expect(markup).toContain('id="nt"')
    expect(markup).toContain('Vec')
    expect(markup).toContain('NT³')
  })
})
