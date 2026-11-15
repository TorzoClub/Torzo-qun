import type { ComponentType } from 'react'
import { GuideAboutChapter } from './about'
import { GuideAboutWebChapter } from './about-web'
import { GuideBranchesChapter } from './branches'
import { GuideElectionChapter } from './election'
import { GuideHistoryChapter } from './history'
import { GuideInterviewChapter } from './interview'
import { GuideMiddlemenChapter } from './middlemen'
import { GuideProvisionChapter } from './provision'

export type GuideChapter = {
  readonly id: string
  readonly number: string
  readonly title: string
  readonly summary: string
  readonly component: ComponentType
}

export const QUN_GUIDE_CHAPTERS: readonly GuideChapter[] = [
  {
    id: 'about',
    number: '01',
    title: '关于',
    summary: '同装会是一个什么地方，以及我们为什么在这里。',
    component: GuideAboutChapter,
  },
  {
    id: 'torzo-qa',
    number: '02',
    title: '同装访谈录',
    summary: '同装精神、格三去、同开独绽异强俗，以及 Torzo 这个名字。',
    component: GuideInterviewChapter,
  },
  {
    id: 'mid-people',
    number: '03',
    title: '同装会中间人',
    summary: '镜像群的管理者，也是紧急情况下的中间人。',
    component: GuideMiddlemenChapter,
  },
  {
    id: 'other-qun',
    number: '04',
    title: '同装会分支',
    summary: '镜像群、同装工坊、内殿团与同装问卷站。',
    component: GuideBranchesChapter,
  },
  {
    id: 'qun-election',
    number: '05',
    title: '群选制',
    summary: '群主与管理员的选举、门槛、任期与注意事项。',
    component: GuideElectionChapter,
  },
  {
    id: 'manager-provision',
    number: '06',
    title: '管理层规定',
    summary: '群设置、踢人与禁言的约定。',
    component: GuideProvisionChapter,
  },
  {
    id: 'manager-history',
    number: '07',
    title: '群历史',
    summary: '2015 到 2016 年的群历史。',
    component: GuideHistoryChapter,
  },
  {
    id: 'about-web',
    number: '08',
    title: '关于本站',
    summary: '本站的版本、与旧版导册的差异，以及转载与纠错说明。',
    component: GuideAboutWebChapter,
  },
]
