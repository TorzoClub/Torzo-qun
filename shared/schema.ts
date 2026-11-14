import { z } from 'zod'
import {
  QUN_ADMIN_PAGE_SIZE,
  QUN_COMMENT_ARTICLE_MAX,
  QUN_COMMENT_ARTICLE_MIN,
  QUN_COMMENT_AUTHOR_MAX,
  QUN_COMMENT_PAGE_SIZE,
  QUN_COMMENT_PAGE_SIZE_MAX,
} from './constants'

function countCodePoints(value: string): number {
  return [...value].length
}

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0
    return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127
  })
}

export const zQunAuthor = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, { message: '你要输入名字才能提交。' })
      .max(QUN_COMMENT_AUTHOR_MAX * 4, {
        message: `名字要在 ${QUN_COMMENT_AUTHOR_MAX} 个字以内`,
      }),
  )
  .refine((value) => countCodePoints(value) <= QUN_COMMENT_AUTHOR_MAX, {
    message: `名字要在 ${QUN_COMMENT_AUTHOR_MAX} 个字以内`,
  })
  .refine((value) => !hasControlCharacters(value), {
    message: '名字里不能有控制字符',
  })

export const zQunArticle = z
  .string()
  .transform((value) => value.replace(/\r\n/g, '\n').trim())
  .pipe(
    z
      .string()
      .min(QUN_COMMENT_ARTICLE_MIN, {
        message: `不到${QUN_COMMENT_ARTICLE_MIN}字就像装逼？呵呵`,
      })
      .max(QUN_COMMENT_ARTICLE_MAX * 4, {
        message: `正文最多 ${QUN_COMMENT_ARTICLE_MAX} 个字`,
      }),
  )
  .refine((value) => countCodePoints(value) >= QUN_COMMENT_ARTICLE_MIN, {
    message: `不到${QUN_COMMENT_ARTICLE_MIN}字就像装逼？呵呵`,
  })
  .refine((value) => countCodePoints(value) <= QUN_COMMENT_ARTICLE_MAX, {
    message: `正文最多 ${QUN_COMMENT_ARTICLE_MAX} 个字`,
  })
  .refine((value) => !hasControlCharacters(value), {
    message: '正文里不能有控制字符',
  })

export const zQunCommentDraft = z.object({
  author: zQunAuthor,
  article: zQunArticle,
})

export const zQunCommentCreateInput = zQunCommentDraft.extend({
  turnstile_token: z.string().max(4096).optional().default(''),
  turnstile_unavailable: z.boolean().optional().default(false),
  website: z.string().max(200).optional().default(''),
  started_at: z.number().int().positive(),
  client_id: z.string().min(8).max(64),
})

export type QunCommentCreateInput = z.infer<typeof zQunCommentCreateInput>

export const zQunCommentID = z.number().int().positive().brand<'CommentID'>()
export type QunCommentID = z.infer<typeof zQunCommentID>

export const zQunComment = z.object({
  id: zQunCommentID,
  author: z.string(),
  article: z.string(),
  created_at: z.iso.datetime(),
})

export type QunComment = z.infer<typeof zQunComment>

export const zQunCommentResponse = z.object({
  comment: zQunComment,
})

export type QunCommentResponse = z.infer<typeof zQunCommentResponse>

export const zQunCommentPage = z.object({
  items: z.array(zQunComment),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  has_more: z.boolean(),
})

export type QunCommentPage = z.infer<typeof zQunCommentPage>

export const zQunCommentRow = z.object({
  id: zQunCommentID,
  author: z.string(),
  article: z.string(),
  created_at: z.number().int(),
})

export type QunCommentRow = z.infer<typeof zQunCommentRow>

export const zQunPageQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  page_size: z.coerce
    .number()
    .int()
    .min(1)
    .max(QUN_COMMENT_PAGE_SIZE_MAX)
    .default(QUN_COMMENT_PAGE_SIZE),
})

export type QunPageQuery = z.infer<typeof zQunPageQuery>

export const zQunAdminPageQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(QUN_ADMIN_PAGE_SIZE),
})

export type QunAdminPageQuery = z.infer<typeof zQunAdminPageQuery>

export const zQunApiError = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
    retry_after_seconds: z.number().int().positive().optional(),
  }),
})

export type QunApiError = z.infer<typeof zQunApiError>

export const zQunAdminDeleteResponse = z.object({
  ok: z.literal(true),
  total: z.number().int().nonnegative(),
})

export type QunAdminDeleteResponse = z.infer<typeof zQunAdminDeleteResponse>

export const zQunTurnstileResponse = z.object({
  success: z.boolean(),
  'error-codes': z.array(z.string()).optional(),
})

export type QunTurnstileResponse = z.infer<typeof zQunTurnstileResponse>

export type QunApiFailure = {
  readonly code: string
  readonly message: string
  readonly fields: Readonly<Record<string, string>> | null
  readonly retry_after_seconds: number | null
  readonly cause: unknown
}
