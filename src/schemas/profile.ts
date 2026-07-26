import { z } from 'zod'
import { ROLE_LABELS } from '../constants/roles'

export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '이름은 2자 이상 입력해주세요.')
    .max(20, '이름은 20자 이하로 입력해주세요.'),
  role: z.enum(ROLE_LABELS, { message: '역할을 선택해주세요.' }),
  // 지역 옵션 상수(regions.ts) 확정되면 Select로 교체
  region: z.string().min(1, '주 활동지역을 입력해주세요.'),
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아니에요.'),
  bio: z.string().max(100, '자기소개는 100자 이하로 입력해주세요.').optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
