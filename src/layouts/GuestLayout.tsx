import type { ReactNode } from 'react'
import logo from '../assets/icons/logo.svg?raw'
import { CONTENT_PX } from '../constants/layout'

/** 게스트 전용 레이아웃 — 로그인 계정 전용 사이드바 내비게이션·알림·프로필 메뉴를 두지 않는다.
 * 로그인된 브라우저에서 공유 링크로 들어와도 실제 계정 화면으로 새어나갈 경로 자체가 없다. */
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-bg-secondary flex min-h-screen flex-col">
      <header className={`flex h-16 shrink-0 items-center ${CONTENT_PX}`}>
        <span
          role="img"
          aria-label="SLATE-TO"
          className="text-primary [&_svg]:h-5 [&_svg]:w-auto"
          dangerouslySetInnerHTML={{ __html: logo }}
        />
      </header>
      <main className={`flex-1 overflow-auto pt-6 pb-20 ${CONTENT_PX}`}>{children}</main>
    </div>
  )
}
