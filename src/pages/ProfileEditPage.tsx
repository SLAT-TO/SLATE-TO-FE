import { useState } from 'react'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import Select from '../components/Select'
import { Button } from '../components/Button'
import { ROLE_OPTIONS } from '../constants/roles'
import { profileSchema, type ProfileFormValues } from '../schemas/profile'
import { validateField } from '../utils/validateField'

// 수정 진입 시 GET /api/v1/users/me 응답으로 초기값 채우기.
// 등록(온보딩 직후)은 빈 값, 수정은 기존 값. 지금은 빈 값 고정.
const INITIAL_VALUES: ProfileFormValues = {
  nickname: '',
  role: '연출',
  region: '',
  email: '',
  bio: '',
}

type FormErrors = Partial<Record<keyof ProfileFormValues, string>>

function ProfileEditPage() {
  const [values, setValues] = useState<ProfileFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  // 프로필 이미지 업로드 API 연동 필요. 지금은 미리보기 URL만.
  const [imagePreview] = useState('https://placehold.co/80x80')

  // 값 변경
  const handleChange = (field: keyof ProfileFormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // onBlur 시 해당 필드만 검증 (메모리 패턴: onBlur + 제출 시 재검증)
  const handleBlur = (field: keyof ProfileFormValues) => () => {
    const message = validateField(profileSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const handleSubmit = () => {
    const result = profileSchema.safeParse(values)
    if (!result.success) {
      // 전체 재검증 후 에러 매핑
      const nextErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProfileFormValues
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }
    // PATCH /api/v1/users/me 로 저장. 성공 시 마이페이지로 이동.
    console.log('프로필 저장:', result.data)
  }

  const handleCancel = () => {
    // 마이페이지로 이동 (라우터 확정 후 navigate 연결)
    console.log('취소')
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* 프로필 사진 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-neutral-11 text-base font-semibold">프로필 사진</h2>
        <div className="flex items-center gap-5">
          <img
            src={imagePreview}
            alt="프로필 미리보기"
            className="h-20 w-20 rounded-full object-cover"
          />
          {/* 이름 + 안내문구 수직 세트 & 우측 버튼 레이아웃 */}
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
        {/* 이름 + 역할: 2열 */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <Input
            label="이름"
            required
            placeholder="이름을 입력하세요."
            value={values.nickname}
            onChange={handleChange('nickname')}
            error={errors.nickname}
          />
          <Select
            label="역할"
            required
            options={ROLE_OPTIONS}
            value={values.role}
            onChange={handleChange('role')}
            onBlur={handleBlur('role')}
            error={errors.role}
            placeholder="역할을 선택하세요."
          />
        </div>

        {/* 지역: 전체 너비 */}
        <Input
          label="지역"
          required
          placeholder="주 활동지역을 입력하세요."
          value={values.region}
          onChange={handleChange('region')}
          error={errors.region}
        />

        {/* 이메일: 전체 너비 */}
        <Input
          label="이메일"
          required
          placeholder="이메일을 입력하세요."
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
        />

        {/* 자기소개: 전체 너비 */}
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

      {/* 저장 / 취소 */}
      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={handleSubmit} className="px-24">
          저장
        </Button>
        <Button variant="secondary" onClick={handleCancel} className="px-24">
          취소
        </Button>
      </div>
    </div>
  )
}

export default ProfileEditPage
