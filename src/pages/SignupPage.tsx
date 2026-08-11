import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import { Button } from '../components/Button'
import signupBg from '../assets/images/signup-bg.png'
import {
  confirmEmailVerificationCode,
  sendEmailVerificationCode,
  signupWithEmail,
} from '../api/auth'
import { ApiError } from '../types/api'
import { signupSchema } from '../schemas/signup'
import { navigate } from '../utils/navigation'

const EMAIL_DOMAIN_OPTIONS = [
  { value: 'gmail.com', label: '@gmail.com' },
  { value: 'naver.com', label: '@naver.com' },
  { value: 'daum.net', label: '@daum.net' },
  { value: 'icloud.com', label: '@icloud.com' },
  { value: 'custom', label: '직접 입력' },
]

type FieldErrors = { name?: string; email?: string; password?: string; passwordConfirm?: string }

// 회원가입 화면. 이름/이메일/비밀번호 입력 + 이메일 인증. 약관 동의는 별도 화면(TermsPage)에서 처리.
export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [errors, setErrors] = useState<FieldErrors>({})
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [codeSendError, setCodeSendError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [codeConfirmError, setCodeConfirmError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const domain = emailDomain === 'custom' ? customDomain : emailDomain
  const fullEmail = email && domain ? `${email}@${domain}` : ''

  // 이메일이 바뀌면 이전에 받은 인증번호는 더 이상 유효하지 않으므로 상태를 초기화
  const invalidateEmailVerification = () => {
    setCodeSent(false)
    setEmailVerified(false)
    setVerifyCode('')
    setCodeSendError(null)
    setCodeConfirmError(null)
  }

  const handleSendCode = async () => {
    if (!fullEmail) {
      setCodeSendError('이메일을 입력해주세요')
      return
    }
    setCodeSendError(null)
    setSendingCode(true)
    try {
      await sendEmailVerificationCode({ email: fullEmail, purpose: 'SIGNUP' })
      setCodeSent(true)
      setEmailVerified(false)
      setVerifyCode('')
    } catch (err) {
      setCodeSendError(
        err instanceof ApiError ? err.message : '인증번호를 보내지 못했습니다. 다시 시도해주세요.',
      )
    } finally {
      setSendingCode(false)
    }
  }

  const handleConfirmCode = async () => {
    if (!verifyCode) {
      setCodeConfirmError('인증번호를 입력해주세요')
      return
    }
    setCodeConfirmError(null)
    setVerifying(true)
    try {
      await confirmEmailVerificationCode({ email: fullEmail, code: verifyCode, purpose: 'SIGNUP' })
      setEmailVerified(true)
    } catch (err) {
      setCodeConfirmError(err instanceof ApiError ? err.message : '인증번호가 올바르지 않습니다.')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async () => {
    const result = signupSchema.safeParse({ name, email: fullEmail, password, passwordConfirm })
    if (!result.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }
    if (!emailVerified) {
      setErrors({ email: '이메일 인증을 완료해주세요' })
      return
    }
    setErrors({})
    setSubmitError(null)
    setSubmitting(true)
    try {
      await signupWithEmail({ name, email: fullEmail, password })
      navigate('/signup/terms')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={signupBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="flex w-full max-w-[1062px] flex-col gap-7"
        >
          <div className="flex flex-col gap-4">
            <p className="text-head-sm text-neutral-1 font-semibold">이름</p>
            <Input
              id="signup-name"
              placeholder="이름을 입력하세요."
              value={name}
              onChange={setName}
              error={errors.name}
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-head-sm text-neutral-1 font-semibold">아이디 (이메일)</p>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="signup-email"
                    placeholder="이메일 아이디를 입력하세요. (예: gildong)"
                    value={email}
                    onChange={(v) => {
                      // 도메인은 오른쪽 드롭다운에서 따로 고르는 구조인데, 전체 이메일을
                      // 붙여넣거나 실수로 입력하면 "아이디@도메인@도메인"처럼 잘못된 값이
                      // 만들어지므로 "@" 뒤는 분리해 도메인 쪽으로 보낸다.
                      const at = v.indexOf('@')
                      if (at === -1) {
                        setEmail(v)
                      } else {
                        setEmail(v.slice(0, at))
                        const domainPart = v.slice(at + 1)
                        const matched = EMAIL_DOMAIN_OPTIONS.find((o) => o.value === domainPart)
                        if (matched) {
                          setEmailDomain(matched.value)
                        } else if (domainPart) {
                          setEmailDomain('custom')
                          setCustomDomain(domainPart)
                        }
                      }
                      invalidateEmailVerification()
                    }}
                    error={errors.email}
                    disabled={emailVerified}
                  />
                </div>
                <div className="w-44 shrink-0">
                  <Select
                    options={EMAIL_DOMAIN_OPTIONS}
                    value={emailDomain}
                    onChange={(v) => {
                      setEmailDomain(v)
                      invalidateEmailVerification()
                    }}
                    placeholder="@gmail.com"
                    disabled={emailVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={sendingCode || emailVerified || !fullEmail}
                  className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 h-12 w-36 shrink-0 rounded-lg border whitespace-nowrap disabled:cursor-not-allowed"
                >
                  {sendingCode ? '전송 중…' : codeSent ? '재전송' : '인증'}
                </button>
              </div>

              {emailDomain === 'custom' && (
                <Input
                  id="signup-email-custom-domain"
                  placeholder="도메인을 입력하세요. (예: example.com)"
                  value={customDomain}
                  onChange={(v) => {
                    setCustomDomain(v)
                    invalidateEmailVerification()
                  }}
                  disabled={emailVerified}
                />
              )}

              {codeSendError && <p className="text-caption-sm text-warning">{codeSendError}</p>}
              {codeSent && !codeSendError && !emailVerified && (
                <p className="text-caption-sm text-neutral-1">인증번호를 보냈어요.</p>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="signup-verify-code"
                    placeholder="인증번호를 입력하세요."
                    value={verifyCode}
                    onChange={setVerifyCode}
                    disabled={!codeSent || emailVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleConfirmCode()}
                  disabled={!codeSent || verifying || emailVerified}
                  className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 h-12 w-36 shrink-0 rounded-lg border whitespace-nowrap disabled:cursor-not-allowed"
                >
                  {verifying ? '확인 중…' : '인증번호 확인'}
                </button>
              </div>
              {codeConfirmError && (
                <p className="text-caption-sm text-warning">{codeConfirmError}</p>
              )}
              {emailVerified && (
                <p className="text-caption-sm text-neutral-1">이메일 인증이 완료됐어요.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-head-sm text-neutral-1 font-semibold">비밀번호</p>
            <Input
              id="signup-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={setPassword}
              showPasswordToggle
              error={errors.password}
            />
            <p className="text-caption-lg text-neutral-1 -mt-1">
              영문, 숫자, 특수문자 포함하여 8자 이상 입력해주세요
            </p>
            <div className="mt-3">
              <Input
                id="signup-password-confirm"
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                showPasswordToggle
                error={errors.passwordConfirm}
              />
            </div>
          </div>

          {submitError && <p className="text-body-sm text-warning text-center">{submitError}</p>}

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
            className="mt-[123px] max-w-[410px] self-center"
          >
            {submitting ? '가입 중…' : '시작하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}
