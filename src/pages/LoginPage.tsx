import { useState } from 'react'
import Input from '../components/Input'
import { Button } from '../components/Button'
import loginBg from '../assets/images/login-bg.png'
import loginAvatar from '../assets/images/login-avatar.png'

// 로그인 화면(페이지). 현재는 UI만 구현, 인증 로직은 이후 작업에서 연결.
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(115deg, #9ff0ff 33.5%, #b9d6ff 98%)',
      }}
    >
      <img src={loginBg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover" />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">SLATE - TO</p>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
        <div className="flex w-full max-w-[1062px] flex-col items-center gap-10">
          <div className="flex w-full max-w-[560px] flex-col items-center gap-10">
            <img src={loginAvatar} alt="" className="size-[100px] rounded-full object-cover" />

            <div className="text-head-md text-neutral-1 text-center font-bold">
              <p>영상 제작의 흐름을 하나로,</p>
              <p>영상 제작자 커뮤니케이션 서비스, 슬레이투</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <Input
              id="login-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={setEmail}
            />
            <Input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={setPassword}
            />
          </div>

          <Button type="submit" fullWidth className="max-w-[410px]">
            로그인
          </Button>

          <div className="text-caption-lg text-neutral-10 -mt-6 flex items-center gap-3">
            <button type="button" className="hover:underline">
              비밀번호 찾기
            </button>
            <span className="text-neutral-5">|</span>
            <button type="button" className="hover:underline">
              회원가입
            </button>
          </div>

          <div className="flex w-full flex-col items-center gap-4">
            <div className="text-caption-lg text-neutral-10 flex w-full items-center gap-4">
              <span className="border-neutral-10/30 h-px flex-1 border-t" />
              SNS 계정으로 로그인
              <span className="border-neutral-10/30 h-px flex-1 border-t" />
            </div>

            <button
              type="button"
              className="bg-neutral-1 border-neutral-5 text-body-sm text-neutral-10 h-12 w-full max-w-[400px] rounded-lg border"
            >
              구글 로그인 / 회원가입
            </button>
            <button
              type="button"
              className="border-neutral-5 text-body-sm text-neutral-10 h-12 w-full max-w-[400px] rounded-lg border bg-[#fee500]"
            >
              카카오 로그인 / 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
