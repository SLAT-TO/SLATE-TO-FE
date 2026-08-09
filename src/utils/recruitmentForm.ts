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
