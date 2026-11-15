export type Result<T, E> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E }

export type WriteFailure = {
  readonly code: string
  readonly message: string
  readonly cause: unknown
}

export function resultOk<T>(data: T): Result<T, never> {
  return { ok: true, data }
}

export function resultErr<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

export async function writeRun<T>(operation: () => Promise<T>): Promise<Result<T, WriteFailure>> {
  try {
    const data = await operation()
    return resultOk(data)
  } catch (error: unknown) {
    return resultErr({
      code: 'WRITE_FAILED',
      message: '写入失败',
      cause: error,
    })
  }
}
