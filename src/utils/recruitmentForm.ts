import type { UserCategory, UserRegion, UserRole } from '../types/user'
import type { ProjectLengthType } from '../types/project'
import type { CreateRecruitmentRequest } from '../types/recruitment'
import type { JobPostFormValues } from '../schemas/jobPost'

/** Date → 'YYYY-MM-DD' (로컬 기준, toISOString은 UTC로 밀림) */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 촬영 기간 직렬화 — BE는 자유 문자열(0~50자)로 받는다 */
export function formatShootingPeriod(from: Date, to: Date): string {
  return `${toDateString(from)} ~ ${toDateString(to)}`
}

export function toRecruitmentRequest(values: JobPostFormValues): CreateRecruitmentRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category as UserCategory,
    lengthType: values.lengthType as ProjectLengthType,
    recruitPart: values.recruitPart as UserRole,
    location: values.location as UserRegion,
    shootingPeriod: formatShootingPeriod(values.shootingPeriod.from, values.shootingPeriod.to),
    pay: values.pay.trim(),
    deadline: toDateString(values.deadline),
  }
}

/** 'YYYY-MM-DD' → Date (로컬 자정 기준) */
export function parseDateString(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** '2026-08-10 ~ 2026-08-13' → { from, to }. 형식이 다르면 undefined */
export function parseShootingPeriod(value: string | null | undefined) {
  if (!value) return undefined
  const [rawFrom, rawTo] = value.split('~').map((s) => s.trim())
  const from = parseDateString(rawFrom)
  const to = parseDateString(rawTo)
  if (!from || !to) return undefined
  return { from, to }
}
