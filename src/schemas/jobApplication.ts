import { z } from 'zod'

export const applicationSchema = z.object({
  comment: z.string().min(1, '코멘트를 입력해주세요.'),
  referenceLink: z.string().url('올바른 URL 형식이 아닙니다.').optional().or(z.literal('')),
  /** 첨부 파일 업로드 API가 돌려준 id 목록 — 현재 화면은 최대 1개만 받는다 */
  fileIds: z.array(z.number()),
})

export type ApplicationValues = z.infer<typeof applicationSchema>
