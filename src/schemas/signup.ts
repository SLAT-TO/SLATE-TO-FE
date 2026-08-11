import { z } from 'zod'

// BE 비밀번호 정책과 동일: 영문·숫자·특수문자 포함 8~64자
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '이름을 입력해주세요')
      .max(20, '이름은 20자 이하로 입력해주세요'),
    email: z.string().trim().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아니에요'),
    password: z
      .string()
      .regex(PASSWORD_PATTERN, '영문, 숫자, 특수문자 포함하여 8자 이상 입력해주세요'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['passwordConfirm'],
  })

export type SignupForm = z.infer<typeof signupSchema>
