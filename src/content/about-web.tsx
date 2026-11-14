import type { ReactElement } from 'react'
import {version} from '../../package.json'

export function GuideAboutWebChapter(): ReactElement {
  return (
    <>
      <p>
        此版本为<a href="/torzo-manual.pdf">PDF</a>的内容拷贝版,如存在偏误,以
        <a href="/torzo-manual.pdf">PDF</a>版本为准.
      </p>
      <p>
        站点版本: {version}
      </p>
      <p>导册的内容禁止任何非官方形式的转载；代码禁止用于任何商业上的目的；</p>
      <p>如有错误,敬请鄙视.</p>
      <div className="qun-prose-block">
        <h3>为之做过贡献的人</h3>
        <ul>
          <li>Vec</li>
          <li>NT³</li>
        </ul>
      </div>
      <h3>装逼时刻</h3>
      <div id="showtime">
        <div id="vec">
          <h3 className="sr-only">Vec</h3>
          <p>
            你好,我是Vec,WEB版导册的开发者兼维护人,这次的开发设计很艰难,但我还是勉勉强强完成了,算是我的第一款童装工坊作品。
          </p>
          <del>
            <p>
              本次的设计我们没有弄以前搞的那几套,用的是全新的想法,然而看起来似乎并不是很好,马马虎虎的感觉?
            </p>
          </del>
          <p>
            后来我们又换成了这种折叠式的界面，解决了【阅读/查询】的冲突问题，似乎赶在一周年之际完成了orz
          </p>
        </div>
        <hr />
        <div id="nt">
          <h3 className="sr-only">NT³</h3>
          中国人就是喜欢在自己参加过的作品去过的地方刻上自己到此一游的印迹
          <br />
          我想我大概也是如此的心情便写了篇废话
          <br />
          <br />
          这个导册站其实全程攻克难关的是Vec，我并没有贡献出什么力量
          <br />
          作为拾荒人，至多的也是催臣上道罢了
          <br />
          至于这个网站是来干嘛，也没什么
          <br />
          作为一个装逼的协会，必然需要有一个装逼的东西来支撑他的存在
          <br />
          或许这就像当年新青年杂志一样，用来作为同装宣传的某个手段吧
          <br />
          这个网页是作为我们Torzo官网的第一步，也是同装第一个可以作为宣传目的的一个网站
          <br />
          “人生交契无老少，论交何必先同调”
          <br />
          不妨各位也把这个网页拿到自己的同学同事身边装个逼，让他们也见证一下同装的精神
          <br />
        </div>
      </div>
    </>
  )
}
