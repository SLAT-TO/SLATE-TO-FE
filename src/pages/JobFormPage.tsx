import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import { Button } from '../components/Button'
import { DateSingleField } from '../components/DateSingleField'
import { DateRangeField } from '../components/DateRangeField'
import type { DateRangeValue } from '../components/DateRangeCalendar'
import HeaderTitle from '../components/HeaderTitle'
import FormField from '../domains/recruit/FormField'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { navigate } from '../utils/navigation'
import { validateField } from '../utils/validateField'
import { jobPostSchema } from '../schemas/jobPost'
import { ROLE_OPTIONS, VIDEO_CATEGORY_OPTIONS, FILM_LENGTH_OPTIONS } from '../constants'
import { REGION_LABELS } from '../constants/recruitFilters'

const REGION_OPTIONS = REGION_LABELS.map((label) => ({ value: label, label }))

function JobFormHeader() {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => navigate('/matching')}
        className="text-caption-lg text-neutral-6 hover:text-neutral-9 w-fit"
      >
        &lt; 공고 목록
      </button>
      <HeaderTitle>공고 작성</HeaderTitle>
    </div>
  )
}

const HEADER = <JobFormHeader />

interface FormValues {
  deadline?: Date
  recruitPart: string
  shootingRegion: string
  videoType: string
  videoLength: string
  participationPeriod?: DateRangeValue
  pay: string
  description: string
}

const INITIAL_VALUES: FormValues = {
  deadline: undefined,
  recruitPart: '',
  shootingRegion: '',
  videoType: '',
  videoLength: '',
  participationPeriod: undefined,
  pay: '',
  description: '',
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function JobFormPage() {
  useHeaderSlot(HEADER)

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (field: keyof FormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof FormValues) => () => {
    const message = validateField(jobPostSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const handleSubmit = () => {
    const result = jobPostSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }
    // TODO: API 연동 — POST /recruitments
    navigate('/matching')
  }

  return (
    <div className="bg-bg-primary shadow-card flex flex-col gap-6 rounded-xl p-8">
      <FormField label="모집 마감일" required error={errors.deadline}>
        <DateSingleField
          value={values.deadline}
          onChange={(date) => setValues((prev) => ({ ...prev, deadline: date }))}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
        <Select
          label="모집파트"
          required
          options={ROLE_OPTIONS}
          value={values.recruitPart}
          onChange={handleChange('recruitPart')}
          onBlur={handleBlur('recruitPart')}
          error={errors.recruitPart}
          placeholder="모집파트를 선택해주세요."
        />

        <Select
          label="촬영 지역"
          required
          options={REGION_OPTIONS}
          value={values.shootingRegion}
          onChange={handleChange('shootingRegion')}
          onBlur={handleBlur('shootingRegion')}
          error={errors.shootingRegion}
          placeholder="촬영 지역을 선택해주세요."
        />

        <Select
          label="영상 유형"
          required
          options={VIDEO_CATEGORY_OPTIONS}
          value={values.videoType}
          onChange={handleChange('videoType')}
          onBlur={handleBlur('videoType')}
          error={errors.videoType}
          placeholder="영상 유형을 입력하세요."
        />

        <Select
          label="영상 길이"
          required
          options={FILM_LENGTH_OPTIONS}
          value={values.videoLength}
          onChange={handleChange('videoLength')}
          onBlur={handleBlur('videoLength')}
          error={errors.videoLength}
          placeholder="영상 길이를 선택해주세요."
        />

        <FormField label="참여기간" required error={errors.participationPeriod}>
          <DateRangeField
            value={values.participationPeriod}
            onChange={(range) => setValues((prev) => ({ ...prev, participationPeriod: range }))}
          />
        </FormField>

        <Input
          label="보수"
          required
          placeholder="보수를 선택해주세요."
          value={values.pay}
          onChange={handleChange('pay')}
          error={errors.pay}
        />
      </div>

      <TextArea
        label="상세설명"
        required
        placeholder="장소를 입력하세요."
        value={values.description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        error={errors.description}
        rows={4}
      />

      <div className="flex justify-center gap-3">
        <Button onClick={handleSubmit} className="w-[180px]">
          등록
        </Button>
        <Button variant="secondary" onClick={() => navigate('/matching')} className="w-[180px]">
          취소
        </Button>
      </div>
    </div>
  )
}

export default JobFormPage
