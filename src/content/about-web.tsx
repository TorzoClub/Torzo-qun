import type { ReactElement } from 'react'
import { version } from '../../package.json'

export function GuideAboutWebChapter(): ReactElement {
  return (
    <>
      <p>站点版本: {version}</p>
      <p>
        此版本为
        <a
          href="/legacy/"
          className="foot-classic"
          target="_blank"
          rel="noopener noreferrer"
          title="同装导册 2016 旧版（只读存档）"
        >
          旧版导册
        </a>
        的翻新版，采用了全新的设计，但功能和内容基本上和旧版导册一致。
      </p>
      <div className="qun-prose-block">
        <p>修改的功能/内容：</p>
        <ul>
          <li>运行在 Cloudflare 边缘计算节点，响应快，服务器费用零花销免费托管。</li>
          <li>“换届记录”更名为“群历史”，并增加了最近几年的简史。</li>
          <li>提交帖子需要验证，防机器人。</li>
          <li>管理界面。</li>
        </ul>
      </div>

      <p>禁止任何非官方形式的转载。</p>

      <p>如有错误,敬请鄙视。</p>
    </>
  )
}
