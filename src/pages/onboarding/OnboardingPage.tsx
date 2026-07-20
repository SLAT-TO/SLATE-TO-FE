import { useEffect, useState } from 'react'
import {
  ONBOARDING_ROLE_OPTIONS,
  ONBOARDING_VIDEO_CATEGORY_OPTIONS,
  REGION_OPTIONS,
} from '../../constants'
import type { OnboardingRole } from '../../constants/onboardingRoles'
import type { OnboardingVideoCategory } from '../../constants/onboardingVideoCategories'
import type { Region } from '../../constants/regions'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { ProfileStep } from './ProfileStep'
import { SelectionStep } from './SelectionStep'

interface OnboardingPageProps {
  /** 온보딩 완료 시 호출 (라우팅 연결 전 임시 훅) */
  onComplete?: () => void
}

// 온보딩 4단계 오케스트레이터. 라우터 도입 전이라 step 인덱스로 화면을 전환한다.
export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0)

  const roles = useOnboardingStore((s) => s.roles)
  const regions = useOnboardingStore((s) => s.regions)
  const categories = useOnboardingStore((s) => s.categories)
  const toggleRole = useOnboardingStore((s) => s.toggleRole)
  const toggleRegion = useOnboardingStore((s) => s.toggleRegion)
  const toggleCategory = useOnboardingStore((s) => s.toggleCategory)

  // 라우터가 없어 step을 브라우저 히스토리에 직접 싣는다.
  // 진입 시 현재 엔트리를 step 0으로 고정하고, 이동마다 pushState해서
  // 기기/브라우저의 '뒤로가기'를 누르면 popstate로 이전 step을 복원한다.
  useEffect(() => {
    history.replaceState({ onboardingStep: 0 }, '')
  }, [])

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const s = (e.state as { onboardingStep?: number } | null)?.onboardingStep
      if (typeof s === 'number') setStep(s)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToStep = (s: number) => {
    setStep(s)
    history.pushState({ onboardingStep: s }, '')
  }

  const next = () => goToStep(step + 1)

  switch (step) {
    case 0:
      return (
        <SelectionStep
          title="어떤 역할로 활동하세요?"
          options={ONBOARDING_ROLE_OPTIONS}
          selected={roles}
          onToggle={(v) => toggleRole(v as OnboardingRole)}
          columns={2}
          onNext={next}
        />
      )
    case 1:
      return (
        <SelectionStep
          title="주로 활동하는 지역을 선택해 주세요."
          options={REGION_OPTIONS}
          selected={regions}
          onToggle={(v) => toggleRegion(v as Region)}
          columns={4}
          onNext={next}
        />
      )
    case 2:
      return (
        <SelectionStep
          title="주로 활동하는 영상 카테고리를 선택해 주세요."
          options={ONBOARDING_VIDEO_CATEGORY_OPTIONS}
          selected={categories}
          onToggle={(v) => toggleCategory(v as OnboardingVideoCategory)}
          columns={2}
          onNext={next}
        />
      )
    default:
      return <ProfileStep onComplete={() => onComplete?.()} />
  }
}
