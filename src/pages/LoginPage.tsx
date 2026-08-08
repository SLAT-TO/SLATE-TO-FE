import { useState } from 'react'
import Input from '../components/Input'
import { Button } from '../components/Button'
import { navigate } from '../utils/navigation'
import { startGoogleLogin } from '../api/auth'
import loginBg from '../assets/images/login-bg.png'
import loginAvatar from '../assets/images/login-avatar.png'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault()
        navigate(to)
      }}
      className="hover:underline"
    >
      {children}
    </a>
  )
}

// 로그인 화면(페이지). 현재는 UI만 구현, 인증 로직은 이후 작업에서 연결.
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 라우팅 가드가 비로그인 상태로 보호된 경로 접근 시 ?redirectTo=로 원래 경로를 실어 보냄 —
  // 있으면 /auth/callback이 refresh 후 그 경로로 보내고, 없으면 온보딩 완료 여부로 알아서 분기
  const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') ?? undefined

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(115deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={loginBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full bg-[#a3dfff] mix-blend-multiply"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
        <div className="flex w-full max-w-[1062px] flex-col items-center gap-10">
          <div className="flex w-full max-w-[560px] flex-col items-center gap-10">
            <img src={loginAvatar} alt="" className="size-[100px] rounded-full object-cover" />

            <div className="text-head-md text-neutral-1 text-center font-bold">
              <p>영상 제작의 흐름을 하나로,</p>
              <p>영상 제작자 커뮤니케이션 서비스, 슬레이투</p>
            </div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full flex-col items-center gap-10"
          >
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
          </form>

          <div className="text-caption-lg text-neutral-10 -mt-6 flex items-center gap-3">
            <NavLink to="/reset-password">비밀번호 찾기</NavLink>
            <span className="text-neutral-5">|</span>
            <NavLink to="/signup">회원가입</NavLink>
          </div>

          <div className="flex w-full flex-col items-center gap-4">
            <div className="text-caption-lg text-neutral-10 flex w-full items-center gap-4">
              <span className="border-neutral-10/30 h-px flex-1 border-t" />
              SNS 계정으로 로그인
              <span className="border-neutral-10/30 h-px flex-1 border-t" />
            </div>

            <button
              type="button"
              // mockUser: 'new' — 온보딩 플로우 체험용 하드코딩 (README 참고)
              onClick={() => void startGoogleLogin({ redirectTo, mockUser: 'new' })}
              className="bg-neutral-1 border-neutral-5 text-body-sm text-neutral-10 h-12 w-full max-w-[400px] rounded-lg border"
            >
              구글 로그인 / 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
