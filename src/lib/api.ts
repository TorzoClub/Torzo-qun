import { QUN_ADMIN_PAGE_SIZE, QUN_COMMENT_PAGE_SIZE } from '../../shared/constants'
import { type Result, resultErr, resultOk } from '../../shared/result'
import {
  type QunAdminDeleteResponse,
  type QunApiFailure,
  type QunCommentCreateInput,
  type QunCommentPage,
  zQunAdminDeleteResponse,
  zQunApiError,
  zQunCommentPage,
  zQunCommentResponse,
} from '../../shared/schema'

function apiFailure(
  code: string,
  message: string,
  cause: unknown,
  fields: Readonly<Record<string, string>> | null = null,
  retry_after_seconds: number | null = null,
): QunApiFailure {
  return { code, message, fields, retry_after_seconds, cause }
}

function parseApiError(body: unknown, status: number): QunApiFailure {
  const parsed = zQunApiError.safeParse(body)
  if (parsed.success) {
    return apiFailure(
      parsed.data.error.code,
      parsed.data.error.message,
      null,
      parsed.data.error.fields ?? null,
      parsed.data.error.retry_after_seconds ?? null,
    )
  } else {
    return apiFailure('HTTP_ERROR', `请求失败（${status}）`, parsed.error)
  }
}

async function readJson(response: Response): Promise<unknown> {
  return await response.json()
}

export async function qunCommentsFetchPage(
  page: number,
): Promise<Result<QunCommentPage, QunApiFailure>> {
  try {
    const response = await fetch(`/api/comments?page=${page}&page_size=${QUN_COMMENT_PAGE_SIZE}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    const body = await readJson(response)
    if (response.ok) {
      const parsed = zQunCommentPage.safeParse(body)
      if (parsed.success) {
        return resultOk(parsed.data)
      } else {
        return resultErr(apiFailure('INVALID_RESPONSE', '留言数据的格式不正确', parsed.error))
      }
    } else {
      return resultErr(parseApiError(body, response.status))
    }
  } catch (error: unknown) {
    return resultErr(apiFailure('NETWORK_ERROR', '读取留言失败，请检查网络后重试', error))
  }
}

export async function qunCommentCreate(
  input: QunCommentCreateInput,
): Promise<Result<QunCommentPage['items'][number], QunApiFailure>> {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    })
    const body = await readJson(response)
    if (response.ok) {
      const parsed = zQunCommentResponse.safeParse(body)
      if (parsed.success) {
        return resultOk(parsed.data.comment)
      } else {
        return resultErr(apiFailure('INVALID_RESPONSE', '留言的格式不正确', parsed.error))
      }
    } else {
      return resultErr(parseApiError(body, response.status))
    }
  } catch (error: unknown) {
    return resultErr(apiFailure('NETWORK_ERROR', '留言没有发出去，请检查网络后重试', error))
  }
}

export async function qunAdminCommentsFetchPage(
  page: number,
): Promise<Result<QunCommentPage, QunApiFailure>> {
  try {
    const response = await fetch(
      `/api/admin/comments?page=${page}&page_size=${QUN_ADMIN_PAGE_SIZE}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    )
    const body = await readJson(response)
    if (response.ok) {
      const parsed = zQunCommentPage.safeParse(body)
      if (parsed.success) {
        return resultOk(parsed.data)
      } else {
        return resultErr(apiFailure('INVALID_RESPONSE', '留言数据的格式不正确', parsed.error))
      }
    } else {
      return resultErr(parseApiError(body, response.status))
    }
  } catch (error: unknown) {
    return resultErr(apiFailure('NETWORK_ERROR', '读取留言失败，请检查网络后重试', error))
  }
}

export async function qunAdminCommentDelete(
  id: number,
): Promise<Result<QunAdminDeleteResponse, QunApiFailure>> {
  try {
    const response = await fetch(`/api/admin/comments/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    const body = await readJson(response)
    if (response.ok) {
      const parsed = zQunAdminDeleteResponse.safeParse(body)
      if (parsed.success) {
        return resultOk(parsed.data)
      } else {
        return resultErr(apiFailure('INVALID_RESPONSE', '删除结果格式不正确', parsed.error))
      }
    } else {
      return resultErr(parseApiError(body, response.status))
    }
  } catch (error: unknown) {
    return resultErr(apiFailure('NETWORK_ERROR', '删除留言失败，请检查网络后重试', error))
  }
}
