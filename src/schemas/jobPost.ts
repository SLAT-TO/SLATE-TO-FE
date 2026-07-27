import { z } from 'zod'

export const jobPostSchema = z.object({
  deadline: z.date({ message: '모집 마감일을 선택해주세요.' }),
  recruitPart: z.string().min(1, '모집파트를 선택해주세요.'),
  shootingRegion: z.string().min(1, '촬영 지역을 선택해주세요.'),
  videoType: z.string().min(1, '영상 유형을 선택해주세요.'),
  videoLength: z.string().min(1, '영상 길이를 선택해주세요.'),
  participationPeriod: z.object({
    from: z.date({ message: '참여기간을 선택해주세요.' }),
    to: z.date({ message: '참여기간을 선택해주세요.' }),
  }),
  pay: z.string().min(1, '보수를 입력해주세요.'),
  description: z.string().min(1, '상세설명을 입력해주세요.'),
})
