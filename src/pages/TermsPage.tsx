import { useState } from 'react'
import Choice from '../components/Choice'
import { Button } from '../components/Button'
import { navigate } from '../utils/navigation'
import { useOnboardingStore } from '../stores/onboardingStore'
import termsBg from '../assets/images/terms-bg.png'
import termsAvatar from '../assets/images/profile-avatar.png'

const TERMS = [
  { key: 'service', label: '이용약관 동의(필수)' },
  { key: 'age', label: '만 14세 이상입니다(필수)' },
  { key: 'privacy', label: '개인정보 처리방침 동의(필수)' },
  { key: 'collect', label: '개인정보 수집 및 이용 동의(필수)' },
] as const

// 약관 동의 화면 — 동의 여부는 온보딩 스토어에 담아 마지막 단계(ProfileStep)의
// submitOnboarding 호출에 실려 BE로 전송된다.
export function TermsPage() {
  const setAgreedTerms = useOnboardingStore((s) => s.setAgreedTerms)

  const [agreed, setAgreed] = useState<Record<(typeof TERMS)[number]['key'], boolean>>({
    service: false,
    age: false,
    privacy: false,
    collect: false,
  })

  const allAgreed = TERMS.every((t) => agreed[t.key])

  const toggleAll = (checked: boolean) => {
    setAgreed(TERMS.reduce((acc, t) => ({ ...acc, [t.key]: checked }), {} as typeof agreed))
  }

  const handleSubmit = () => {
    if (!allAgreed) return
    setAgreedTerms(true)
    navigate('/onboarding')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={termsBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="bg-neutral-1 flex w-full max-w-[1062px] flex-col gap-12 rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]"
        >
          <div className="flex items-center gap-6">
            <img src={termsAvatar} alt="" className="size-[100px] rounded-full object-cover" />
            <div className="text-neutral-10 flex flex-col">
              <p className="text-head-lg font-bold">슬레이투</p>
              <p className="text-body-sm">영상 커뮤니케이션 서비스</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Choice
              type="checkbox"
              checked={allAgreed}
              onChange={toggleAll}
              label="모두 동의합니다."
            />
            <div className="border-neutral-5 flex flex-col gap-3 border-t pt-5">
              {TERMS.map((t) => (
                <Choice
                  key={t.key}
                  type="checkbox"
                  checked={agreed[t.key]}
                  onChange={(checked) => setAgreed((prev) => ({ ...prev, [t.key]: checked }))}
                  label={t.label}
                />
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth disabled={!allAgreed}>
            동의하고 시작하기
          </Button>
        </form>
      </div>
    </div>
  )
}
