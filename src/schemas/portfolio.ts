import { z } from 'zod'
import { ROLE_LABELS } from '../constants/roles'
import { VIDEO_CATEGORY_LABELS } from '../constants/videoCategories'

export const portfolioSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(50, '제목은 50자 이하로 입력해주세요.'),
  clientName: z.string().max(30, '클라이언트명은 30자 이하로 입력해주세요.').optional(),
  type: z.enum(VIDEO_CATEGORY_LABELS, { message: '프로젝트 유형을 선택해주세요.' }),
  role: z.enum(ROLE_LABELS, { message: '맡은 역할을 선택해주세요.' }),
  youtubeUrl: z
    .string()
    .min(1, '프로젝트 링크를 입력해주세요.')
    .url('올바른 링크 형식이 아니에요.'),
  description: z
    .string()
    .min(1, '프로젝트 설명을 입력해주세요.')
    .max(500, '설명은 500자 이하로 입력해주세요.'),
  comment: z.string().max(500, '코멘트는 500자 이하로 입력해주세요.').optional(),
})

export type PortfolioFormValues = z.infer<typeof portfolioSchema>
