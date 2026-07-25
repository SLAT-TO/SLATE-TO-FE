import { z } from 'zod'

export const applicationSchema = z.object({
  comment: z.string().min(1, '코멘트를 입력해주세요.'),
  referenceLink: z.string().url('올바른 URL 형식이 아닙니다.').optional().or(z.literal('')),
  file: z.instanceof(File).nullable().optional(),
})

export type ApplicationValues = z.infer<typeof applicationSchema>
