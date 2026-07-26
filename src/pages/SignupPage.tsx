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

const TERMS = [
  { key: 'age', label: '만 14세 이상입니다(필수)' },
  { key: 'service', label: '이용약관 동의(필수)' },
  { key: 'privacy', label: '개인정보 처리방침 동의(필수)' },
  { key: 'collect', label: '개인정보 수집 및 이용 동의(필수)' },
] as const

function TermCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="bg-neutral-1 border-neutral-1 flex size-3 shrink-0 items-center justify-center rounded-sm border">
        {checked && (
          <svg
            viewBox="0 0 20 20"
            className="text-main-3 size-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-caption-lg text-neutral-1">{label}</span>
    </label>
  )
}

// 회원가입 화면. 이름/이메일/비밀번호 입력 + 약관 동의. 이메일 인증·가입 처리 로직은 이후 작업에서 연결.
export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [agreed, setAgreed] = useState<Record<(typeof TERMS)[number]['key'], boolean>>({
    age: false,
    service: false,
    privacy: false,
    collect: false,
  })

  const allAgreed = TERMS.every((t) => agreed[t.key])

  const toggleAll = (checked: boolean) => {
    setAgreed(TERMS.reduce((acc, t) => ({ ...acc, [t.key]: checked }), {} as typeof agreed))
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
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-[1062px] flex-col gap-8"
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
            <p className="text-caption-lg text-neutral-1 -mt-2">
              영문, 숫자, 특수문자 포함하여 8자 이상 입력해주세요
            </p>
            <Input
              id="signup-password-confirm"
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              showPasswordToggle
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-white pb-3">
              <TermCheckbox label="모두 동의합니다." checked={allAgreed} onChange={toggleAll} />
            </div>
            <div className="flex flex-col gap-2">
              {TERMS.map((t) => (
                <TermCheckbox
                  key={t.key}
                  label={t.label}
                  checked={agreed[t.key]}
                  onChange={(checked) => setAgreed((prev) => ({ ...prev, [t.key]: checked }))}
                />
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth className="max-w-[410px] self-center">
            시작하기
          </Button>
        </form>
      </div>
    </div>
  )
}
