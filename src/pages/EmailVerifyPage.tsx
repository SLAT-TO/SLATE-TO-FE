import { useState } from 'react'
import Input from '../components/Input'
import { Button } from '../components/Button'
import emailVerifyBg from '../assets/images/email-verify-bg.png'

// 회원가입 - 이메일 인증 요청 화면. 인증 메일 발송 로직은 이후 작업에서 연결.
export function EmailVerifyPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={emailVerifyBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-[1062px] flex-col items-start gap-10"
        >
          <div className="text-neutral-1 flex max-w-[672px] flex-col gap-3">
            <p className="text-head-sm font-bold">가입하신 이메일 주소를 입력해 주세요.</p>
            <p className="text-body-sm">입력하신 이메일은 안전하게 보호됩니다.</p>
          </div>

          <Input
            id="verify-email"
            type="email"
            placeholder="이메일 주소 입력하기"
            value={email}
            onChange={setEmail}
          />

          <Button type="submit" fullWidth className="max-w-[410px] self-center">
            인증 메일 보내기
          </Button>
        </form>

        <p className="text-caption-lg text-neutral-1 text-center">
          인증 메일이 오지 않나요?
          <br />
          스팸함을 확인하거나 재발송을 요청하세요.
        </p>
      </div>
    </div>
  )
}
