import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import { Button } from '../components/Button'
import signupBg from '../assets/images/signup-bg.png'

const EMAIL_DOMAIN_OPTIONS = [
  { value: 'gmail.com', label: '@gmail.com' },
  { value: 'naver.com', label: '@naver.com' },
  { value: 'daum.net', label: '@daum.net' },
  { value: 'icloud.com', label: '@icloud.com' },
  { value: 'custom', label: '직접 입력' },
]

// 회원가입 화면. 이름/이메일/비밀번호 입력만 담당 — 약관 동의는 별도 화면(TermsPage)에서 처리.
// 이메일 인증·가입 처리 로직은 이후 작업에서 연결.
export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

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
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-[1062px] flex-col gap-7"
        >
          <div className="flex flex-col gap-4">
            <p className="text-head-sm text-neutral-1 font-semibold">이름</p>
            <Input
              id="signup-name"
              placeholder="이름을 입력하세요."
              value={name}
              onChange={setName}
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-head-sm text-neutral-1 font-semibold">아이디 (이메일)</p>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="이메일을 입력하세요."
                    value={email}
                    onChange={setEmail}
                  />
                </div>
                <div className="w-44 shrink-0">
                  <Select
                    options={EMAIL_DOMAIN_OPTIONS}
                    value={emailDomain}
                    onChange={setEmailDomain}
                    placeholder="@gmail.com"
                  />
                </div>
                <button
                  type="button"
                  className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 h-12 w-36 shrink-0 rounded-lg border whitespace-nowrap"
                >
                  인증
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="signup-verify-code"
                    placeholder="인증번호를 입력하세요."
                    value={verifyCode}
                    onChange={setVerifyCode}
                  />
                </div>
                <button
                  type="button"
                  className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 h-12 w-36 shrink-0 rounded-lg border whitespace-nowrap"
                >
                  인증번호 확인
                </button>
              </div>
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
              />
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-[123px] max-w-[410px] self-center">
            시작하기
          </Button>
        </form>
      </div>
    </div>
  )
}
