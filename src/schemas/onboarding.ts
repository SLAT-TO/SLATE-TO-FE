import { z } from 'zod'

// 프로필 만들기 단계 — 이름·이메일은 필수, 소개는 선택.
// 필드별 blur 검증은 profileSchema.shape.<field> 로, 제출 검증은 profileSchema 전체로.
export const profileSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요').max(20, '이름은 20자 이하로 입력해주세요'),
  email: z.string().trim().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아니에요'),
  intro: z.string().trim().max(200, '소개는 200자 이하로 입력해주세요').optional(),
})

export type ProfileForm = z.infer<typeof profileSchema>
