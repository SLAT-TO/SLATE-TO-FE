import type { ReactNode } from 'react'

import onboardingBg from '../../assets/images/onboarding.png'

interface OnboardingLayoutProps {
  title: string
  subtitle?: string
  /** 단계별 본문 (칩 그리드·폼 등) */
  children: ReactNode
  /** 하단 영역 (주로 '다음' 버튼) */
  footer: ReactNode
  /** 서브타이틀-본문 간격 (기본 mt-10=40px) */
  contentGapClassName?: string
  /** 본문-footer 간격 (기본 mt-10=40px) */
  footerGapClassName?: string
}

// 온보딩 4단계 공통 껍데기 — 배경 이미지 + 로고 + 타이틀/서브타이틀.
export function OnboardingLayout({
  title,
  subtitle,
  children,
  footer,
  contentGapClassName = 'mt-10',
  footerGapClassName = 'mt-10',
}: OnboardingLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* 배경 이미지 (블러) */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${onboardingBg})` }}
      />

      {/* 로고 */}
      <header className="relative z-10 pt-[43px] pl-[80px]">
        <span className="font-logo text-[20.484px] leading-[100%] font-normal tracking-[-0.41px] text-white select-none">
          SLATE-TO
        </span>
      </header>

      {/* 본문 */}
      <main className="relative z-10 mx-auto flex w-full max-w-257.5 flex-1 flex-col items-center justify-center px-6 py-8">
        <div
          className={`bg-neutral-1 flex w-265.5 flex-col items-center justify-between rounded-[10.242px] px-27 py-12.5 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]`}
        >
          <div className="flex w-full flex-col items-center">
            <div className="w-full text-center">
              <h1 className="text-head-lg text-neutral-11 leading-[170%] font-bold capitalize">
                {title}
              </h1>
              {subtitle && (
                <p className="text-body-lg text-neutral-11 mt-5 leading-[normal] font-normal tracking-[-0.4px] capitalize">
                  {subtitle}
                </p>
              )}
            </div>

            <div className={`w-full ${contentGapClassName}`}>{children}</div>
          </div>

          <div className={`flex justify-center ${footerGapClassName}`}>{footer}</div>
        </div>
      </main>
    </div>
  )
}
