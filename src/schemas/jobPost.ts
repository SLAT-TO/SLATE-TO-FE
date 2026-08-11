import { z } from 'zod'

const notBlank = (message: string) => z.string().trim().min(1, message)

export const jobPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '공고 제목을 입력해주세요.')
    .min(5, '제목은 5자 이상 입력해주세요.')
    .max(50, '제목은 50자 이내로 입력해주세요.'),
  deadline: z.date({ message: '모집 마감일을 선택해주세요.' }),
  recruitPart: notBlank('모집파트를 선택해주세요.'),
  location: notBlank('촬영 지역을 선택해주세요.'),
  category: notBlank('영상 유형을 선택해주세요.'),
  lengthType: notBlank('영상 길이를 선택해주세요.'),
  shootingPeriod: z.object({
    from: z.date({ message: '참여기간을 선택해주세요.' }),
    to: z.date({ message: '참여기간을 선택해주세요.' }),
  }),
  pay: notBlank('보수를 입력해주세요.').max(50, '보수는 50자 이내로 입력해주세요.'),
  description: notBlank('상세설명을 입력해주세요.').max(
    2000,
    '상세설명은 2000자 이내로 입력해주세요.',
  ),
})

export type JobPostFormValues = z.infer<typeof jobPostSchema>
