import { useEffect, useState, useRef, type ChangeEvent } from 'react'
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
import { getMe, updateProfile, uploadProfileImage } from '../api/users'
import type { UserCategory, UserRole, UserRegion } from '../types/user'
import { useUserStore } from '../stores/userStore'
import { validateProfileImage } from '../utils/profileImage'

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
  const [imagePreview, setImagePreview] = useState('https://placehold.co/80x80')
  // 저장 시점에 업로드하기 위해 선택한 파일을 들고 있는다
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 화면에서 다루지 않는 값은 서버 값을 그대로 되돌려보내 삭제를 막는다
  const [serverCategories, setServerCategories] = useState<UserCategory[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((me) => {
        if (cancelled) return
        setServerCategories(me.categories)
        setValues({
          nickname: me.nickname,
          roles: me.roles,
          regions: me.regions as string[],
          email: me.email,
          bio: me.bio ?? '',
        })
        if (me.profileImageUrl) setImagePreview(me.profileImageUrl)
      })
      .catch(() => {
        if (!cancelled) setLoadError('프로필 정보를 불러오지 못했습니다.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 언마운트 시 마지막 미리보기 blob URL 해제
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

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

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const message = validateProfileImage(file)
    if (message) {
      setImageError(message)
      return
    }

    setImageError(null)
    setImageFile(file)
    setImagePreview((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
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
      const updated = await updateProfile({
        nickname: result.data.nickname,
        bio: result.data.bio,
        locations: result.data.regions as UserRegion[],
        roles: result.data.roles as UserRole[],
        categories: serverCategories.length > 0 ? serverCategories : undefined,
      })
      // 프로필 저장이 성공한 뒤에 이미지를 올려, 저장 실패 시 사진만 바뀌는 상태를 막는다
      const profileImageUrl = imageFile
        ? (await uploadProfileImage(imageFile)).profileImageUrl
        : updated.profileImageUrl
      // PATCH 응답엔 email·socialType 등이 없어 setUser로 통째로 덮으면 유실된다 — 병합만 한다
      useUserStore.getState().patchUser({
        nickname: updated.nickname,
        bio: updated.bio,
        profileImageUrl,
        regions: updated.locations,
        region: updated.locations[0] ?? null,
        location: updated.locations[0] ?? null,
        primaryRole: updated.primaryRole,
        roles: updated.roles,
        categories: updated.categories,
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
              <span className="text-neutral-5 text-xs">Jpg, Png, Webp 파일 2MB 이하</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={handleImageSelect}
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              변경하기
            </Button>
          </div>
        </div>
        {imageError && <p className="text-caption-sm text-warning">{imageError}</p>}
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
          disabled
          hint="이메일은 변경할 수 없습니다."
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
