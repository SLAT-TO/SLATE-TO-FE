import { z } from 'zod'
import { ROLE_OPTIONS } from '../constants/roles'
import { VIDEO_CATEGORY_OPTIONS } from '../constants/videoCategories'

const ROLE_VALUES = ROLE_OPTIONS.map((o) => o.value) as [string, ...string[]]
const TYPE_VALUES = VIDEO_CATEGORY_OPTIONS.map((o) => o.value) as [string, ...string[]]

export const portfolioSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(50, '제목은 50자 이하로 입력해주세요.'),
  clientName: z.string().max(30, '클라이언트명은 30자 이하로 입력해주세요.').optional(),
  // 화면에는 라벨을 보여주되 값은 BE enum으로 유지
  type: z.enum(TYPE_VALUES, { message: '프로젝트 유형을 선택해주세요.' }),
  roles: z.array(z.enum(ROLE_VALUES)).min(1, '맡은 역할을 선택해주세요.'),
  youtubeUrl: z
    .string()
    .min(1, '프로젝트 링크를 입력해주세요.')
    // https:// 없이 입력해도 통과하도록 보정
    .transform((v) => (/^https?:\/\//.test(v) ? v : `https://${v}`))
    .pipe(z.url('올바른 링크 형식이 아니에요.')),
  description: z
    .string()
    .min(1, '프로젝트 설명을 입력해주세요.')
    .max(500, '설명은 500자 이하로 입력해주세요.'),
  comment: z.string().max(500, '코멘트는 500자 이하로 입력해주세요.').optional(),
})

export type PortfolioFormValues = z.infer<typeof portfolioSchema>
