import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react'
import Input from '../components/Input'
import { Button } from '../components/Button'
import CheckIcon from '../components/icons/CheckIcon'
import resetPasswordBg from '../assets/images/reset-password-bg.png'
import { sendEmailVerificationCode, confirmEmailVerificationCode, resetPassword } from '../api/auth'
import { ApiError } from '../types/api'
import { resetPasswordEmailSchema, resetPasswordFormSchema } from '../schemas/resetPassword'
import { navigate } from '../utils/navigation'

type Step = 'email' | 'code' | 'newPassword' | 'done'

const CODE_LENGTH = 6

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-1 flex min-h-[600px] w-full max-w-[1062px] flex-col gap-[60px] rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
      {children}
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault()
        navigate(to)
      }}
      className="text-caption-lg text-primary text-center hover:underline"
    >
      {children}
    </a>
  )
}

function CodeBoxInput({
  values,
  onChange,
}: {
  values: string[]
  onChange: (next: string[]) => void
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...values]
    next[index] = digit
    onChange(next)
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    onChange(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ''))
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => setDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="bg-neutral-2 border-neutral-5 text-neutral-8 focus:border-primary size-[64px] rounded-xl border-2 text-center text-2xl outline-none"
        />
      ))}
    </div>
  )
}

// 비밀번호 찾기 플로우: 이메일 → 인증코드 → 새 비밀번호 → 완료
export function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('email')

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sendingCode, setSendingCode] = useState(false)

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [codeError, setCodeError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string
    newPasswordConfirm?: string
  }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSendCode = async () => {
    const result = resetPasswordEmailSchema.safeParse(email)
    if (!result.success) {
      setEmailError(result.error.issues[0].message)
      return
    }
    setEmailError(null)
    setSendingCode(true)
    try {
      await sendEmailVerificationCode({ email: result.data, purpose: 'PASSWORD_RESET' })
      setStep('code')
    } catch (err) {
      setEmailError(
        err instanceof ApiError ? err.message : '인증코드를 보내지 못했습니다. 다시 시도해주세요.',
      )
    } finally {
      setSendingCode(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setResendMessage(null)
    setCodeError(null)
    try {
      await sendEmailVerificationCode({ email, purpose: 'PASSWORD_RESET' })
      setCode(Array(CODE_LENGTH).fill(''))
      setResendMessage('인증코드를 다시 보냈어요.')
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : '인증코드를 다시 보내지 못했습니다.')
    } finally {
      setResending(false)
    }
  }

  const handleConfirmCode = async () => {
    const joined = code.join('')
    if (joined.length < CODE_LENGTH) {
      setCodeError('인증코드 6자리를 모두 입력해주세요')
      return
    }
    setCodeError(null)
    setVerifying(true)
    try {
      await confirmEmailVerificationCode({ email, code: joined, purpose: 'PASSWORD_RESET' })
      setStep('newPassword')
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : '인증코드가 올바르지 않습니다.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResetPassword = async () => {
    const result = resetPasswordFormSchema.safeParse({ newPassword, newPasswordConfirm })
    if (!result.success) {
      const nextErrors: typeof passwordErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof passwordErrors
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setPasswordErrors(nextErrors)
      return
    }
    setPasswordErrors({})
    setSubmitError(null)
    setSubmitting(true)
    try {
      await resetPassword({ email, newPassword: result.data.newPassword })
      setStep('done')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={resetPasswordBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full bg-[rgba(149,211,245,0.4)] mix-blend-multiply"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {step === 'email' && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSendCode()
              }}
              className="flex flex-1 flex-col gap-[60px]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-head-lg text-neutral-10 font-bold">비밀번호 찾기</p>
                <p className="text-caption-lg text-neutral-5">
                  가입 시 사용한 이메일을 입력해주세요. 인증 코드를 보내드릴게요.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-head-sm text-neutral-10 font-semibold">이메일</p>
                <Input
                  id="reset-password-email"
                  type="email"
                  placeholder="이메일을 입력하세요."
                  value={email}
                  onChange={(v) => {
                    setEmail(v)
                    setEmailError(null)
                  }}
                  error={emailError ?? undefined}
                />
              </div>

              <div className="mt-auto flex flex-col items-center gap-[30px]">
                <Button type="submit" fullWidth disabled={sendingCode}>
                  {sendingCode ? '전송 중…' : '인증코드 발송'}
                </Button>
                <NavLink to="/login">로그인 화면으로 이동</NavLink>
              </div>
            </form>
          </Card>
        )}

        {step === 'code' && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleConfirmCode()
              }}
              className="flex flex-1 flex-col gap-[60px]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-head-lg text-neutral-10 font-bold">인증코드 입력</p>
                <p className="text-caption-lg text-neutral-5">
                  {email}로 인증코드를 발송했어요.
                  <br />
                  이메일을 확인하고 인증코드를 입력해주세요.
                </p>
              </div>

              <CodeBoxInput values={code} onChange={setCode} />
              {codeError && (
                <p className="text-caption-sm text-warning -mt-8 text-center">{codeError}</p>
              )}

              <div className="mt-auto flex flex-col items-center gap-5">
                <Button type="submit" fullWidth disabled={verifying}>
                  {verifying ? '확인 중…' : '확인'}
                </Button>
                <button
                  type="button"
                  onClick={() => void handleResendCode()}
                  disabled={resending}
                  className="text-caption-lg text-neutral-5 hover:underline disabled:cursor-not-allowed"
                >
                  {resending ? '재전송 중…' : '이메일을 받지 못했나요?'}
                </button>
                {resendMessage && (
                  <p className="text-caption-sm text-neutral-5 -mt-3">{resendMessage}</p>
                )}
              </div>
            </form>
          </Card>
        )}

        {step === 'newPassword' && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleResetPassword()
              }}
              className="flex flex-1 flex-col gap-[60px]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-head-lg text-neutral-10 font-bold">새 비밀번호 설정</p>
                <p className="text-caption-lg text-neutral-5">새 비밀번호를 입력해주세요.</p>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <p className="text-head-sm text-neutral-10 font-semibold">새 비밀번호</p>
                  <Input
                    id="reset-password-new"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요."
                    value={newPassword}
                    onChange={setNewPassword}
                    showPasswordToggle
                    error={passwordErrors.newPassword}
                  />
                  <p className="text-caption-sm text-neutral-5 -mt-2">
                    8자 이상, 영문/숫자/특수문자 조합을 사용해주세요.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-head-sm text-neutral-10 font-semibold">새 비밀번호 확인</p>
                  <Input
                    id="reset-password-new-confirm"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요."
                    value={newPasswordConfirm}
                    onChange={setNewPasswordConfirm}
                    showPasswordToggle
                    error={passwordErrors.newPasswordConfirm}
                  />
                </div>
              </div>

              {submitError && (
                <p className="text-body-sm text-warning text-center">{submitError}</p>
              )}

              <Button type="submit" fullWidth disabled={submitting} className="mt-auto">
                {submitting ? '변경 중…' : '비밀번호 변경'}
              </Button>
            </form>
          </Card>
        )}

        {step === 'done' && (
          <Card>
            <div className="flex flex-1 flex-col gap-[60px]">
              <div className="flex flex-col items-center gap-5">
                <div className="bg-main-1 flex size-[100px] items-center justify-center rounded-full">
                  <CheckIcon className="text-primary size-[36px]" />
                </div>
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-head-lg text-neutral-10 font-bold">
                    비밀번호가 변경되었습니다
                  </p>
                  <p className="text-caption-lg text-neutral-5">새 비밀번호로 로그인해주세요</p>
                </div>
              </div>

              <Button fullWidth className="mt-auto" onClick={() => navigate('/login')}>
                로그인 화면으로 이동하기
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
