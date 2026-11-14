import { type ReactElement, useCallback, useEffect, useState } from 'react'
import type { QunComment, QunCommentPage } from '../../shared/schema'
import { QunErrorNotice } from '../components/QunErrorNotice'
import { QunPageTitle } from '../components/QunPageTitle'
import { QunSiteFooter } from '../components/QunSiteFooter'
import { QunSiteHeader } from '../components/QunSiteHeader'
import { qunAdminCommentDelete, qunAdminCommentsFetchPage } from '../lib/api'
import { qunFormatCommentDate } from '../lib/format'

export function QunAdminPage(): ReactElement {
  const [page, setPage] = useState(1)
  const [page_data, setPageData] = useState<QunCommentPage | null>(null)
  const [is_loading, setIsLoading] = useState(true)
  const [error_message, setErrorMessage] = useState<string | null>(null)
  const [deleting_id, setDeletingId] = useState<number | null>(null)

  const loadPage = useCallback(async (next_page: number): Promise<void> => {
    setIsLoading(true)
    setErrorMessage(null)
    const result = await qunAdminCommentsFetchPage(next_page)
    if (result.ok) {
      setPageData(result.data)
      setPage(result.data.page)
    } else {
      setErrorMessage(result.error.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadPage(1)
  }, [loadPage])

  async function deleteComment(comment: QunComment): Promise<void> {
    const confirmed = window.confirm(`确定删除 #${comment.id} 这条留言？此操作不可恢复。`)
    if (!confirmed) {
      return
    } else {
      setDeletingId(comment.id)
      setErrorMessage(null)
      const result = await qunAdminCommentDelete(comment.id)
      if (result.ok) {
        const remaining = page_data === null ? 0 : page_data.items.length - 1
        if (remaining <= 0 && page > 1) {
          await loadPage(page - 1)
        } else {
          await loadPage(page)
        }
      } else {
        setErrorMessage(result.error.message)
      }
      setDeletingId(null)
    }
  }

  return (
    <div className="qun-page">
      <QunPageTitle title="留言管理 · 同装导册" />
      <QunSiteHeader variant="admin" />
      <main id="qun-main" className="qun-admin">
        <header className="qun-admin-head">
          <p className="qun-eyebrow">ADMIN / 留言管理</p>
          <h1 className="qun-admin-title">留言管理</h1>
          <p className="qun-admin-dek">只做两件事：看总数，删留言。</p>
          <p className="qun-admin-note">这个页面由 Cloudflare Access 保护。</p>
        </header>

        {is_loading ? (
          <p className="qun-admin-loading">读取中…</p>
        ) : error_message !== null && page_data === null ? (
          <QunErrorNotice
            message={error_message}
            on_retry={() => {
              void loadPage(page)
            }}
          />
        ) : page_data === null ? (
          <p className="qun-admin-loading">没有读到留言。</p>
        ) : (
          <>
            <div className="qun-admin-summary">
              <p>
                共 <strong>{page_data.total}</strong> 条留言
              </p>
              <button
                type="button"
                className="qun-button qun-button-ghost qun-button-small"
                onClick={() => {
                  void loadPage(page)
                }}
              >
                刷新
              </button>
            </div>

            {error_message === null ? null : <QunErrorNotice message={error_message} />}

            {page_data.items.length === 0 ? (
              <p className="qun-admin-loading">这一页没有留言。</p>
            ) : (
              <ol className="qun-admin-list">
                {page_data.items.map((comment) => {
                  const date = qunFormatCommentDate(comment.created_at)
                  return (
                    <li key={comment.id} className="qun-admin-item">
                      <div className="qun-admin-item-meta">
                        <span className="qun-admin-id">#{comment.id}</span>
                        <span className="qun-admin-date">
                          {date.year}.{date.month_day} {date.time}
                        </span>
                        <span className="qun-admin-author">{comment.author}</span>
                      </div>
                      <p className="qun-admin-article">{comment.article}</p>
                      <button
                        type="button"
                        className="qun-button qun-button-danger qun-button-small"
                        onClick={() => {
                          void deleteComment(comment)
                        }}
                        disabled={deleting_id === comment.id}
                      >
                        {deleting_id === comment.id ? '删除中…' : '删除'}
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}

            <div className="qun-admin-pagination">
              <button
                type="button"
                className="qun-button qun-button-ghost qun-button-small"
                onClick={() => {
                  void loadPage(page - 1)
                }}
                disabled={page <= 1}
              >
                上一页
              </button>
              <span>第 {page} 页</span>
              <button
                type="button"
                className="qun-button qun-button-ghost qun-button-small"
                onClick={() => {
                  void loadPage(page + 1)
                }}
                disabled={!page_data.has_more}
              >
                下一页
              </button>
            </div>
          </>
        )}
      </main>
      <QunSiteFooter />
    </div>
  )
}
