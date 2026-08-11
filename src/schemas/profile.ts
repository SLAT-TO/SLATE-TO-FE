import { z } from 'zod'
import { ROLE_OPTIONS } from '../constants/roles'
import { ONBOARDING_REGION_OPTIONS } from '../constants/regions'

const ROLE_VALUES = ROLE_OPTIONS.map((o) => o.value) as [string, ...string[]]
const REGION_VALUES = ONBOARDING_REGION_OPTIONS.map((o) => o.value) as [string, ...string[]]

export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '이름은 2자 이상 입력해주세요.')
    .max(20, '이름은 20자 이하로 입력해주세요.'),
  // 화면에는 라벨을 보여주되 값은 BE enum으로 유지
  roles: z.array(z.enum(ROLE_VALUES)).min(1, '역할을 선택해주세요.'),
  regions: z.array(z.enum(REGION_VALUES)).min(1, '주 활동지역을 선택해주세요.'),
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아니에요.'),
  bio: z.string().max(100, '자기소개는 100자 이하로 입력해주세요.').optional(),
})
export type ProfileFormValues = z.infer<typeof profileSchema>
