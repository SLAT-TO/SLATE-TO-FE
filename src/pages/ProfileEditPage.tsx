import { useEffect, useState } from 'react'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import MultiSelect from '../components/MultiSelect'
import { Button } from '../components/Button'
import { ROLE_OPTIONS } from '../constants/roles'
import { ONBOARDING_REGION_OPTIONS } from '../constants/regions'
import { profileSchema, type ProfileFormValues } from '../schemas/profile'
import { validateField } from '../utils/validateField'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { navigate } from '../utils/navigation'
import { getMe, updateProfile } from '../api/users'
import type { SocialType, UserCategory, UserRole, UserRegion } from '../types/user'

const INITIAL_VALUES: ProfileFormValues = {
  nickname: '',
  roles: [],
  regions: [],
  email: '',
  bio: '',
}

type FormErrors = Partial<Record<keyof ProfileFormValues, string>>

const HEADER = <HeaderTitle>프로필 수정</HeaderTitle>

function ProfileEditPage() {
  useHeaderSlot(HEADER)
  const [values, setValues] = useState<ProfileFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  // 프로필 이미지 업로드 API 연동 필요. 지금은 미리보기 URL만.
  const [imagePreview] = useState('https://placehold.co/80x80')
  const [socialType, setSocialType] = useState<SocialType | null>(null)
  // 화면에서 다루지 않는 값은 서버 값을 그대로 되돌려보내 삭제를 막는다
  const [serverCategories, setServerCategories] = useState<UserCategory[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const isSocialAccount = socialType !== null && socialType !== 'EMAIL'

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((me) => {
        if (cancelled) return
        setSocialType(me.socialType)
        setServerCategories(me.categories)
        setValues({
          nickname: me.nickname,
          roles: me.roles,
          regions: me.regions as string[],
          email: me.email,
          bio: me.bio ?? '',
        })
      })
      .catch(() => {
        if (!cancelled) setLoadError('프로필 정보를 불러오지 못했습니다.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (field: keyof ProfileFormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleMultiChange = (field: 'roles' | 'regions') => (next: string[]) => {
    setValues((prev) => ({ ...prev, [field]: next }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // onBlur 시 해당 필드만 검증
  const handleBlur = (field: keyof ProfileFormValues) => () => {
    const message = validateField(profileSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const handleSubmit = async () => {
    const result = profileSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProfileFormValues
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    setSaveError(null)
    try {
      await updateProfile({
        nickname: result.data.nickname,
        bio: result.data.bio,
        locations: result.data.regions as UserRegion[],
        roles: result.data.roles as UserRole[],
        // 화면에서 다루지 않지만 미전달 시 삭제될 수 있어 그대로 돌려보냄
        // (BE가 빈 배열을 거부하므로 비어 있으면 아예 보내지 않음 → 기존 값 유지)
        categories: serverCategories.length > 0 ? serverCategories : undefined,
      })
      navigate('/mypage')
    } catch {
      setSaveError('저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/mypage')
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* 프로필 사진 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <img
            src={imagePreview}
            alt="프로필 미리보기"
            className="h-20 w-20 rounded-full object-cover"
          />
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-neutral-11 text-lg font-semibold">
                {values.nickname || '이름'}
              </span>
              <span className="text-neutral-5 text-xs">Png, Jpg 파일 5MB 이하</span>
            </div>
            <Button variant="secondary" size="sm">
              변경하기
            </Button>
          </div>
        </div>
      </section>

      {/* 입력 필드 */}
      <section className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <Input
            label="이름"
            required
            placeholder="이름을 입력하세요."
            value={values.nickname}
            onChange={handleChange('nickname')}
            onBlur={handleBlur('nickname')}
            error={errors.nickname}
          />
          <MultiSelect
            label="역할"
            required
            options={ROLE_OPTIONS}
            selected={values.roles}
            onChange={handleMultiChange('roles')}
            error={errors.roles}
            placeholder="역할을 선택하세요."
          />
        </div>

        <MultiSelect
          label="지역"
          required
          options={ONBOARDING_REGION_OPTIONS}
          selected={values.regions}
          onChange={handleMultiChange('regions')}
          error={errors.regions}
          placeholder="주 활동지역을 선택하세요."
        />

        <Input
          label="이메일"
          required
          placeholder="이메일을 입력하세요."
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          disabled={isSocialAccount}
          hint={isSocialAccount ? '소셜 로그인 계정은 이메일을 변경할 수 없습니다.' : undefined}
        />

        <TextArea
          label="자기소개"
          placeholder="자기소개를 입력하세요."
          value={values.bio ?? ''}
          onChange={handleChange('bio')}
          onBlur={handleBlur('bio')}
          error={errors.bio}
          maxLength={100}
          rows={1}
          className="bg-neutral-2"
        />
      </section>

      {(loadError || saveError) && (
        <p className="text-caption-sm text-warning text-center">{loadError ?? saveError}</p>
      )}

      <div className="flex justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={isSaving}
          className="px-24"
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
        <Button variant="secondary" onClick={handleCancel} className="px-24">
          취소
        </Button>
      </div>
    </div>
  )
}

export default ProfileEditPage
