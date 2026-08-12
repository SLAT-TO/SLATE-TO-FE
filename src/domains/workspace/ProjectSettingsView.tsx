import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateProject } from '../../api/projects'
import ConfirmModal from '../../components/ConfirmModal'
import ProjectForm, { type ProjectFormValues } from '../../components/ProjectForm'
import { useCreateProjectMutation, useDeleteProjectMutation } from '../../queries/projects'
import { invalidateProjectActivityData } from '../../queries/projectInvalidation'
import { CARD_BASE } from '../../styles/card'
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

export default function ProjectSettingsView(props: ProjectSettingsViewProps) {
  const queryClient = useQueryClient()
  const isCreate = props.mode === 'create'
  const project = isCreate ? null : props.project
  const { onCancel } = props
  const createMutation = useCreateProjectMutation()
  const deleteMutation = useDeleteProjectMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const initialValues: ProjectFormValues = {
    title: project?.title ?? '',
    endDate: project?.endDate ?? '',
    clientName: project?.clientName ?? '',
    type: project?.type ?? '',
    lengthType: project?.lengthType ?? '',
    description: project?.description ?? '',
    roleName: project?.roleNames?.[0] ?? '',
  }

  const submit = async (values: ProjectFormValues) => {
    if (isCreate) {
      const created = await createMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        type: values.type,
        lengthType: values.lengthType,
        endDate: values.endDate,
        clientName: values.clientName.trim() || undefined,
        roleNames: [values.roleName],
      })
      props.onCreated(created)
      return
    }

    await updateProject(props.project.id, {
      title: values.title.trim(),
      endDate: values.endDate || undefined,
      clientName: values.clientName.trim() || undefined,
      type: values.type || undefined,
      lengthType: values.lengthType || undefined,
      description: values.description.trim() || undefined,
    })
    void invalidateProjectActivityData(queryClient, props.project.id)
    props.onSaved({
      ...props.project,
      title: values.title.trim(),
      endDate: values.endDate,
      clientName: values.clientName.trim() || null,
      type: values.type,
      lengthType: values.lengthType,
      description: values.description.trim() || null,
    })
  }

  const confirmDelete = () => {
    if (isCreate) return
    deleteMutation.mutate(props.project.id, {
      onSuccess: () => navigate('/workspace'),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      {!isCreate && <h1 className="text-head-md text-neutral-11 font-bold">프로젝트 설정</h1>}

      <div className={`mx-auto w-full max-w-[640px] ${CARD_BASE} p-6 sm:p-8`}>
        {isCreate && <h1 className="text-head-sm text-neutral-11 mb-6 font-bold">새 프로젝트</h1>}
        <ProjectForm
          mode={isCreate ? 'create' : 'edit'}
          initialValues={initialValues}
          onSubmit={submit}
          onCancel={onCancel}
          onDelete={isCreate ? undefined : () => setDeleteOpen(true)}
        />
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
