import { z } from 'zod'

export const createVideoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  youtubeUrl: z.string().min(1, 'YouTube 링크를 입력해주세요.').url('올바른 URL 형식이 아닙니다.'),
  memo: z.string().optional(),
})

export type CreateVideoValues = z.infer<typeof createVideoSchema>

export const updateVideoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  youtubeUrl: z.string().min(1, '링크를 입력해주세요.').url('올바른 URL 형식이 아닙니다.'),
  memo: z.string().optional(),
})

export type UpdateVideoValues = z.infer<typeof updateVideoSchema>
