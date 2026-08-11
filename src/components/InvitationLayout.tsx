import type { ReactNode } from 'react'
import inviteBg from '../assets/images/invite-bg.png'

type InvitationLayoutProps = {
  children: ReactNode
}

type InvitationCardProps = {
  children: ReactNode
}

/** 프로젝트·게스트 초대 수락 플로우가 공통으로 사용하는 전체 화면 레이아웃. */
export function InvitationLayout({ children }: InvitationLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={inviteBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  )
}

/** 초대 수락 단계의 콘텐츠 카드. */
export function InvitationCard({ children }: InvitationCardProps) {
  return (
    <div className="bg-neutral-1 flex min-h-[600px] w-full max-w-[1062px] flex-col gap-[60px] rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
      {children}
    </div>
  )
}
