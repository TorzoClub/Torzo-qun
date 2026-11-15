import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { qunRenderPage } from '../src/entry-server'

type PrerenderRoute = {
  readonly path: string
  readonly out: string
  readonly title: string
  readonly description: string
  readonly url: string
  readonly robots: string | null
}

const SITE_ORIGIN = 'https://guide.torzo.club'

const ROUTES: readonly PrerenderRoute[] = [
  {
    path: '/',
    out: 'index.html',
    title: '同装导册 · 同装会 Torzo Club',
    description:
      '同装会（共同装逼协会）导册：关于、同装访谈录、群选制、管理层规定与内殿团换届记录。自 2015 年起。',
    url: `${SITE_ORIGIN}/`,
    robots: null,
  },
  {
    path: '/guestbook',
    out: 'guestbook.html',
    title: '留言板 · 同装导册',
    description: '同装会留言板：九年来，来过的人留下的话。',
    url: `${SITE_ORIGIN}/guestbook`,
    robots: null,
  },
  {
    path: '/admin',
    out: 'admin.html',
    title: '留言管理 · 同装导册',
    description: '同装会留言管理。',
    url: `${SITE_ORIGIN}/admin`,
    robots: 'noindex, nofollow',
  },
  {
    path: '/404',
    out: '404.html',
    title: '页面不存在 · 同装导册',
    description: '这一页不在同装导册里。',
    url: `${SITE_ORIGIN}/404`,
    robots: 'noindex, nofollow',
  },
]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function headMarkup(route: PrerenderRoute): string {
  const robots_meta =
    route.robots === null
      ? ''
      : `\n    <meta name="robots" content="${escapeHtml(route.robots)}" />`
  return `<!--qun:head:start-->
    <title>${escapeHtml(route.title)}</title>
    <meta name="description" content="${escapeHtml(route.description)}" />
    <link rel="canonical" href="${escapeHtml(route.url)}" />
    <meta property="og:title" content="${escapeHtml(route.title)}" />
    <meta property="og:description" content="${escapeHtml(route.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(route.url)}" />
    <meta property="og:image" content="${SITE_ORIGIN}/images/og.png" />
    <meta property="og:locale" content="zh_CN" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />${robots_meta}
    <!--qun:head:end-->`
}

function sitemap(build_date: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <lastmod>${build_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_ORIGIN}/guestbook</loc>
    <lastmod>${build_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
`
}

const template_path = resolve(process.cwd(), 'dist/index.html')
const template = await readFile(template_path, 'utf8')
const root_marker = '<div id="root"></div>'
if (!template.includes(root_marker)) {
  throw new Error('dist/index.html 里找不到 #root 占位符')
} else {
  for (const route of ROUTES) {
    const markup = qunRenderPage(route.path)
    const with_root = template.replace(root_marker, `<div id="root">${markup}</div>`)
    const with_head = with_root.replace(
      /<!--qun:head:start-->[\s\S]*?<!--qun:head:end-->/,
      headMarkup(route),
    )
    await writeFile(resolve(process.cwd(), 'dist', route.out), with_head, 'utf8')
    console.log(`prerender ${route.path} -> dist/${route.out}`)
  }
  const build_date = new Date().toISOString().slice(0, 10)
  await writeFile(resolve(process.cwd(), 'dist/sitemap.xml'), sitemap(build_date), 'utf8')
  console.log('prerender sitemap -> dist/sitemap.xml')
}
