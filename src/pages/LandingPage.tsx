import landingBg from '../assets/images/landing-bg.png'

function ArrowForwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 랜딩 페이지. 로그인 전 진입 화면 — 서비스 소개 + 워크스페이스 진입 CTA.
export function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <img src={landingBg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover" />
      <div className="absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[#a9e2ff]/60 to-transparent mix-blend-multiply" />

      <div className="relative z-10 flex min-h-screen flex-col justify-center gap-12 px-8 py-16 md:px-20">
        <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white md:top-16 md:left-20">
          SLATE - TO
        </p>

        <div className="flex max-w-xl flex-col gap-5">
          <p className="text-body-sm leading-8 font-semibold text-white/70">
            영상 제작 과정에서의 모든 소통을 하나의 흐름으로
            <br />
            매칭부터 프로젝트 관리까지,
          </p>
          <p className="text-[42px] leading-[70px] font-bold text-white">
            영상 제작자들을 위한
            <br />
            올인원 <span className="text-[#0b284e]">협업 워크스페이스</span>
          </p>
        </div>

        <button
          type="button"
          className="flex w-fit items-center gap-3 rounded-full bg-white/20 px-8 py-4 text-lg font-semibold tracking-tight text-white"
        >
          워크 스페이스로 가기
          <ArrowForwardIcon />
        </button>
      </div>
    </div>
  )
}
