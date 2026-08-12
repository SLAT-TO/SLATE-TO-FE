import { useState } from 'react'
import { Button } from './Button'
import { DateSingleField } from './DateSingleField'
import Input from './Input'
import Select from './Select'
import TextArea from './TextArea'
import { ROLE_OPTIONS } from '../constants/roles'
import { PROJECT_LENGTH_TYPE_LABEL, PROJECT_TYPE_LABEL } from '../constants/projectLabels'
import { ApiError } from '../types/api'

export type ProjectFormValues = {
  title: string
  endDate: string
  clientName: string
  type: string
  lengthType: string
  description: string
  roleName: string
}

type ProjectFormProps = {
  mode: 'create' | 'edit'
  initialValues: ProjectFormValues
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

const TYPE_OPTIONS = Object.entries(PROJECT_TYPE_LABEL).map(([value, label]) => ({ value, label }))
const LENGTH_OPTIONS = Object.entries(PROJECT_LENGTH_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}))

function toDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toDateString(date: Date | undefined): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 워크스페이스에서 프로젝트를 생성·수정할 때 쓰는 공용 폼.
 * API 요청과 화면 이동은 사용하는 화면이 맡고, 이 컴포넌트는 입력·검증·제출 상태만 관리한다.
 */
export default function ProjectForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
}: ProjectFormProps) {
  const isCreate = mode === 'create'
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const hasRequiredProjectValues = Boolean(
    values.title.trim() &&
    values.description.trim() &&
    values.type &&
    values.lengthType &&
    values.endDate,
  )
  const canSubmit = isCreate
    ? hasRequiredProjectValues && Boolean(values.roleName)
    : hasRequiredProjectValues

  const updateValue = (key: keyof ProjectFormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || saving) return

    setSaving(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : isCreate
            ? '프로젝트를 만들지 못했습니다.'
            : '프로젝트를 저장하지 못했습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <Input
        value={values.title}
        onChange={updateValue('title')}
        label="프로젝트명"
        placeholder="프로젝트명을 입력해주세요."
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-caption-lg text-neutral-9 font-semibold">
          프로젝트 마감일
          <span className="text-warning ml-0.5">*</span>
        </label>
        <DateSingleField
          value={toDate(values.endDate)}
          onChange={(date) => updateValue('endDate')(toDateString(date))}
          className="w-full"
        />
      </div>

      <Input
        value={values.clientName}
        onChange={updateValue('clientName')}
        label="클라이언트명 (선택)"
        placeholder="클라이언트명을 입력해주세요."
      />

      <Select
        options={LENGTH_OPTIONS}
        value={values.lengthType}
        onChange={updateValue('lengthType')}
        label="영상 길이"
        placeholder="영상 길이를 선택해주세요."
        required
      />

      <Select
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={updateValue('type')}
        label="프로젝트 유형"
        placeholder="프로젝트 유형을 선택해주세요."
        required
      />

      <TextArea
        value={values.description}
        onChange={updateValue('description')}
        label="프로젝트 설명"
        placeholder="프로젝트 설명을 입력해주세요."
        rows={4}
        required
      />

      {isCreate && (
        <Select
          options={ROLE_OPTIONS}
          value={values.roleName}
          onChange={updateValue('roleName')}
          label="나의 역할"
          placeholder="나의 역할을 선택해주세요."
          required
        />
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-warning text-caption-sm w-fit font-semibold underline"
        >
          프로젝트 삭제
        </button>
      )}

      {submitError && <p className="text-caption-sm text-warning text-center">{submitError}</p>}

      <div className="flex justify-center gap-4 pt-2">
        <Button variant="primary" size="sm" type="submit" disabled={saving || !canSubmit}>
          {isCreate ? '확인' : '저장'}
        </Button>
        <Button variant="negative" size="sm" onClick={onCancel} disabled={saving}>
          취소
        </Button>
      </div>
    </form>
  )
}
