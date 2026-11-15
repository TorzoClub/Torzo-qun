import { type ReactElement, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { QunComment, QunCommentPage } from '../../shared/schema'
import { QunAquaFoot } from '../components/aqua/QunAquaFoot'
import { QunAquaMasthead } from '../components/aqua/QunAquaMasthead'
import { QunAquaTotop } from '../components/aqua/QunAquaTotop'
import { QunSkeuomorphismButton } from '../components/aqua/QunSkeuomorphismButton'
import { QunPageTitle } from '../components/QunPageTitle'
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
    <div>
      <QunPageTitle title="留言管理 · 同装导册" />
      <main id="page">
        <QunAquaMasthead title="留言管理" subtitle="ADMIN · 同装会" />
        <p className="aqua-back">
          <Link to="/">← 返回导册</Link>
        </p>
        <div className="aqua-panel">
          <h2 className="aqua-panel-title">留言管理</h2>
          {is_loading ? (
            <p className="aqua-admin-loading">读取中…</p>
          ) : page_data === null ? (
            <>
              <p className="aqua-error">{error_message ?? '没有读到留言。'}</p>
              <QunSkeuomorphismButton
                type="button"
                tone="aqua"
                onClick={() => {
                  void loadPage(page)
                }}
              >
                重新连接
              </QunSkeuomorphismButton>
            </>
          ) : (
            <>
              <div className="aqua-admin-summary">
                <p>
                  共 <strong>{page_data.total}</strong> 条留言
                </p>
                <QunSkeuomorphismButton
                  type="button"
                  tone="aqua"
                  onClick={() => {
                    void loadPage(page)
                  }}
                >
                  刷新
                </QunSkeuomorphismButton>
              </div>
              {error_message === null ? null : <p className="aqua-error">{error_message}</p>}
              {page_data.items.length === 0 ? (
                <p className="aqua-admin-loading">这一页没有留言。</p>
              ) : (
                <ul className="aqua-admin-list">
                  {page_data.items.map((comment) => {
                    const date = qunFormatCommentDate(comment.created_at)
                    return (
                      <li key={comment.id} className="aqua-admin-item">
                        <div className="aqua-admin-meta">
                          <span className="aqua-admin-id">#{comment.id}</span>
                          <span>
                            {date.year}.{date.month_day} {date.time}
                          </span>
                          <span className="aqua-admin-author">{comment.author}</span>
                        </div>
                        <p className="aqua-admin-article">{comment.article}</p>
                        <div className="aqua-admin-actions">
                          <QunSkeuomorphismButton
                            type="button"
                            tone="danger"
                            onClick={() => {
                              void deleteComment(comment)
                            }}
                            disabled={deleting_id === comment.id}
                          >
                            {deleting_id === comment.id ? '删除中…' : '删除'}
                          </QunSkeuomorphismButton>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <div className="aqua-admin-pagination">
                <QunSkeuomorphismButton
                  type="button"
                  tone="aqua"
                  onClick={() => {
                    void loadPage(page - 1)
                  }}
                  disabled={page <= 1}
                >
                  上一页
                </QunSkeuomorphismButton>
                <span>第 {page} 页</span>
                <QunSkeuomorphismButton
                  type="button"
                  tone="aqua"
                  onClick={() => {
                    void loadPage(page + 1)
                  }}
                  disabled={!page_data.has_more}
                >
                  下一页
                </QunSkeuomorphismButton>
              </div>
            </>
          )}
        </div>
      </main>
      <QunAquaFoot />
      <QunAquaTotop />
    </div>
  )
}
