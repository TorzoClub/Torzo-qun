import { describe, expect, it } from 'vitest'
import { qunCreateClientID } from '../src/lib/client-id'

describe('client id', () => {
  it('生成稳定的、长度足够的 id', () => {
    const first = qunCreateClientID(1760000000000, 0.123456789)
    const second = qunCreateClientID(1760000000000, 0.123456789)
    expect(first).toBe(second)
    expect(first.length).toBeGreaterThanOrEqual(8)
    expect(first).toMatch(/^q-[0-9a-z]+-[0-9a-z]+$/)
  })
})
