import { useState } from 'react'
import { updateProject } from '../../api/projects'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import Input from '../../components/Input'
import Select from '../../components/Select'
import TextArea from '../../components/TextArea'
import { ROLE_OPTIONS } from '../../constants/roles'
import { PROJECT_LENGTH_TYPE_LABEL, PROJECT_TYPE_LABEL } from '../../constants/projectLabels'
import { useCreateProjectMutation, useDeleteProjectMutation } from '../../queries/projects'
import { CARD_BASE } from '../../styles/card'
import { ApiError } from '../../types/api'
import { navigate } from '../../utils/navigation'
import type { ProjectDetailResponse, ProjectResponse } from '../../types/project'

type ProjectSettingsViewProps =
  | {
      mode?: 'edit'
      project: ProjectDetailResponse
      onCancel: () => void
      onSaved: (project: ProjectDetailResponse) => void
    }
  | {
      mode: 'create'
      onCancel: () => void
      onCreated: (project: ProjectResponse) => void
    }

const TYPE_OPTIONS = Object.entries(PROJECT_TYPE_LABEL).map(([value, label]) => ({ value, label }))
const LENGTH_OPTIONS = Object.entries(PROJECT_LENGTH_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}))

export default function ProjectSettingsView(props: ProjectSettingsViewProps) {
  const isCreate = props.mode === 'create'
  const project = isCreate ? null : props.project
  const { onCancel } = props
  const createMutation = useCreateProjectMutation()
  const deleteMutation = useDeleteProjectMutation()

  const [title, setTitle] = useState(project?.title ?? '')
  const [endDate, setEndDate] = useState(project?.endDate ?? '')
  const [clientName, setClientName] = useState(project?.clientName ?? '')
  const [type, setType] = useState(project?.type ?? '')
  const [lengthType, setLengthType] = useState(project?.lengthType ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [roleName, setRoleName] = useState(project?.roleNames?.[0] ?? '')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canSubmit = isCreate
    ? Boolean(title.trim() && description.trim() && type && lengthType && endDate && roleName)
    : Boolean(title.trim())

  const submit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setSubmitError(null)
    let navigatedAway = false
    try {
      if (isCreate) {
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          type,
          lengthType,
          endDate,
          clientName: clientName.trim() || undefined,
          roleNames: [roleName],
        })
        navigatedAway = true
        props.onCreated(created)
        return
      }

      await updateProject(props.project.id, {
        title: title.trim(),
        endDate: endDate || undefined,
        clientName: clientName.trim() || undefined,
        type: type || undefined,
        lengthType: lengthType || undefined,
        description: description.trim() || undefined,
      })
      props.onSaved({
        ...props.project,
        title: title.trim(),
        endDate,
        clientName: clientName.trim() || null,
        type,
        lengthType,
        description: description.trim() || null,
      })
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : isCreate
            ? '프로젝트를 만들지 못했습니다.'
            : '프로젝트를 저장하지 못했습니다.',
      )
    } finally {
      if (!navigatedAway) setSaving(false)
    }
  }

  const confirmDelete = () => {
    if (isCreate) return
    deleteMutation.mutate(props.project.id, {
      onSuccess: () => navigate('/workspace'),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-head-md text-neutral-11 font-bold">
        {isCreate ? '새 프로젝트' : '프로젝트 설정'}
      </h1>

      <div className={`flex flex-col gap-8 ${CARD_BASE} p-8`}>
        <Input
          value={title}
          onChange={setTitle}
          label="프로젝트명"
          placeholder="프로젝트명을 입력해주세요."
          required
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption-lg text-neutral-9 font-semibold">
              프로젝트 마감일
              {isCreate && <span className="text-warning ml-0.5">*</span>}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={isCreate}
              aria-required={isCreate || undefined}
              className="border-neutral-3 text-body-sm h-12 rounded-lg border px-4"
            />
          </div>
          <Input
            value={clientName}
            onChange={setClientName}
            label="클라이언트명"
            placeholder="클라이언트명을 입력해주세요."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Select
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
            label="프로젝트 유형"
            placeholder="프로젝트 유형을 선택해주세요."
            required={isCreate}
          />
          <Select
            options={LENGTH_OPTIONS}
            value={lengthType}
            onChange={setLengthType}
            label="영상 길이"
            placeholder="영상 길이를 선택해주세요."
            required={isCreate}
          />
        </div>

        <TextArea
          value={description}
          onChange={setDescription}
          label="설명"
          placeholder="설명을 입력해주세요."
          rows={4}
          required={isCreate}
        />

        {isCreate && (
          <Select
            options={ROLE_OPTIONS}
            value={roleName}
            onChange={setRoleName}
            label="나의 역할"
            hint="프로젝트 생성자의 역할을 선택해 주세요"
            placeholder="역할을 선택해주세요."
            required
          />
        )}

        {!isCreate && (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-warning text-caption-sm w-fit font-semibold underline"
          >
            프로젝트 삭제
          </button>
        )}

        {submitError && <p className="text-caption-sm text-warning text-center">{submitError}</p>}

        <div className="flex justify-center gap-4">
          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={saving || !canSubmit}
            className="w-60"
          >
            확인
          </Button>
          <Button variant="secondary" size="md" onClick={onCancel} className="w-60">
            취소
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="프로젝트를 삭제할까요?"
        description="삭제한 프로젝트는 복구할 수 없습니다."
      />
    </section>
  )
}
