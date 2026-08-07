import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import { getMe, submitOnboarding } from '../../api/users'
import { ApiError } from '../../types/api'
import { profileSchema } from '../../schemas/onboarding'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { OnboardingLayout } from './OnboardingLayout'

interface ProfileStepProps {
  onComplete: () => void
}

// 온보딩 마지막 단계 — 프로필 입력. 이름·이메일은 필수(제출 검증), 소개는 선택.
export function ProfileStep({ onComplete }: ProfileStepProps) {
  const profile = useOnboardingStore((s) => s.profile)
  const setProfileField = useOnboardingStore((s) => s.setProfileField)
  const agreedTerms = useOnboardingStore((s) => s.agreedTerms)
  const roles = useOnboardingStore((s) => s.roles)
  const regions = useOnboardingStore((s) => s.regions)
  const categories = useOnboardingStore((s) => s.categories)

  const [errors, setErrors] = useState<{ name?: string; email?: string; intro?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const nameId = useId()
  const emailId = useId()
  const introId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 새 이미지를 고를 때 이전 object URL을 정리하기 위해 마지막 값을 보관
  const objectUrlRef = useRef<string>('')

  // 컴포넌트 언마운트 시 마지막 object URL 정리
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  // 소셜 로그인 이메일 자동입력 — 최초 1회만 채우고, 그 뒤 사용자가 지워도 다시 덮어쓰지 않음
  const emailPrefillAttempted = useRef(false)
  useEffect(() => {
    if (emailPrefillAttempted.current || profile.email) return
    emailPrefillAttempted.current = true

    let cancelled = false
    getMe()
      .then((me) => {
        if (!cancelled && me.email) setProfileField('email', me.email)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [profile.email, setProfileField])

  // 텍스트 필드 갱신 + 입력 중이면 해당 필드 에러 해제 (제출 시 전체 재검증)
  const updateField = (field: 'name' | 'email' | 'intro', value: string) => {
    setProfileField(field, value)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setProfileField('avatarFile', file)
    setProfileField('avatarUrl', url)
  }

  const handleSubmit = async () => {
    // 제출 시 전체 스키마로 재검증
    const result = profileSchema.safeParse({
      name: profile.name,
      email: profile.email,
      intro: profile.intro,
    })
    if (!result.success) {
      const nextErrors: typeof errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof errors
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }
    setErrors({})
    setSubmitError(null)
    setSubmitting(true)
    try {
      await submitOnboarding({
        agreedTerms,
        nickname: profile.name,
        roles,
        regions,
        categories,
        bio: profile.intro || undefined,
      })
      onComplete()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : '온보딩 정보를 저장하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OnboardingLayout
      title="프로필을 만들어 주세요."
      subtitle="나중에 변경할 수 있어요"
      footer={
        <div className="flex flex-col items-center gap-3">
          {submitError && <p className="text-body-sm text-warning">{submitError}</p>}
          <Button width={846} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중…' : '다음'}
          </Button>
        </div>
      }
    >
      {/* 160(아바타) + 86(gap) + 736(입력 필드 채우기) = 982px */}
      <div className="mx-auto flex w-full max-w-245.5 flex-col items-center gap-21.5 sm:flex-row sm:items-start">
        {/* 아바타 + 변경하기: 서브타이틀과 106px 간격(입력 필드 컬럼은 기존 40px 유지, 여기만 66px 추가) */}
        <div className="mt-3 flex w-40 shrink-0 flex-col items-center gap-9">
          <Avatar src={profile.avatarUrl} size={160} />
          <Button
            variant="primary"
            size="md"
            disabled
            onClick={() => fileInputRef.current?.click()}
          >
            변경하기
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="sr-only"
            aria-label="프로필 사진 변경"
          />
        </div>

        {/* 입력 필드 — 파란 배경 위 흰 라벨이라 컴포넌트 label 대신 직접 렌더 */}
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label
              htmlFor={nameId}
              className="text-head-sm text-neutral-1 leading-[normal] font-semibold capitalize"
            >
              이름
            </label>
            <Input
              id={nameId}
              placeholder="이름을 입력하세요."
              value={profile.name}
              onChange={(v) => updateField('name', v)}
              error={errors.name}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor={emailId}
              className="text-head-sm text-neutral-1 leading-[normal] font-semibold capitalize"
            >
              이메일
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder="이메일을 입력하세요."
              value={profile.email}
              onChange={(v) => updateField('email', v)}
              error={errors.email}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor={introId}
              className="text-head-sm text-neutral-1 leading-[normal] font-semibold capitalize"
            >
              소개
            </label>
            <TextArea
              id={introId}
              placeholder="소개를 입력하세요."
              value={profile.intro}
              onChange={(v) => updateField('intro', v)}
              rows={3}
              maxLength={200}
              error={errors.intro}
              className="bg-neutral-2!"
            />
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
