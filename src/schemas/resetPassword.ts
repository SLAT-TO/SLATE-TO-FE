import { z } from 'zod'
import { PASSWORD_PATTERN } from './signup'

export const resetPasswordEmailSchema = z
  .string()
  .trim()
  .min(1, '이메일을 입력해주세요')
  .email('올바른 이메일 형식이 아니에요')

export const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .regex(PASSWORD_PATTERN, '영문, 숫자, 특수문자 포함하여 8자 이상 입력해주세요'),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['newPasswordConfirm'],
  })

export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>
