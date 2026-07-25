import type { z } from 'zod'

/** 필드 하나 검증 — 성공 시 '', 실패 시 첫 번째 Zod 이슈 메시지 */
export function validateField<T extends z.ZodTypeAny>(schema: T, value: unknown) {
  const result = schema.safeParse(value)
  return result.success ? '' : result.error.issues[0].message
}
