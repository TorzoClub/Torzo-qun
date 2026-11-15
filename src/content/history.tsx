import type { ReactElement } from 'react'

type GuideHistoryRow = {
  readonly role: string
  readonly names: readonly string[]
}

type GuideHistoryTerm = {
  readonly title: string
  readonly date: string
  readonly rows: readonly GuideHistoryRow[]
}

const HISTORY_TERMS: readonly GuideHistoryTerm[] = [
  {
    title: '第壹届',
    date: '2015/10/04',
    rows: [
      { role: '群主', names: ['NT³'] },
      { role: '管理员', names: ['Vec', '李清羽', 'K.B³', '执', '尘生'] },
    ],
  },
  {
    title: '第贰届',
    date: '2016/04/21',
    rows: [
      { role: '群主', names: ['Vec'] },
      { role: '群众管理员', names: ['凌雪', 'D 爷', '红莲卿'] },
      { role: '群主管理员', names: ['NT³'] },
    ],
  },
  {
    title: '第叁届',
    date: '2016/08/23',
    rows: [
      { role: '群主', names: ['Vec'] },
      { role: '群众管理员', names: ['红莲卿', 'J.C', '肾宝'] },
      { role: '群主管理员', names: ['NT³'] },
    ],
  },
  {
    title: '第肆届',
    date: '2016/12/21',
    rows: [
      { role: '群主', names: ['NT³'] },
      { role: '群众管理员', names: ['Vec', '纞Kd. 御宅', '肾宝'] },
      { role: '群主管理员', names: ['红莲卿', '云芝新'] },
    ],
  },
  {
    title: '瘫痪时代',
    date: '2017/??/??',
    rows: [{ role: '解释', names: ['从此之后不再举行群选'] }],
  },
  {
    title: '疫情时代',
    date: '2020/03/04',
    rows: [
      { role: '临时群主', names: ['哈维'] },
      { role: '临时管理员', names: ['Vec', 'NT'] },
      {
        role: '解释',
        names: [
          '这一天同装群被封，NT炸号。后群恢复，借着这次动荡清理了很多潜水群友。群选制早已名存实亡，由哈维担任临时群主。',
        ],
      },
    ],
  },
  {
    title: 'AI时代',
    date: '2022/06/17',
    rows: [
      { role: '临时群主', names: ['哈维'] },
      { role: '临时管理员', names: ['Vec', 'NT'] },
      { role: '解释', names: ['又一次炸群。同样，借着这次动荡清理了很多潜水群友。'] },
    ],
  },
]

export function GuideHistoryChapter(): ReactElement {
  return (
    <div className="qun-history">
      {HISTORY_TERMS.map((term) => (
        <section key={term.title} className="qun-history-term">
          <header className="qun-history-head">
            <h3>{term.title}</h3>
            <span className="qun-term-date">{term.date}</span>
          </header>
          <dl className="qun-history-rows">
            {term.rows.map((row) => (
              <div key={row.role} className="qun-history-row">
                <dt>{row.role}</dt>
                <dd>
                  {row.names.map((name) => (
                    <span key={name} className="qun-history-name">
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
