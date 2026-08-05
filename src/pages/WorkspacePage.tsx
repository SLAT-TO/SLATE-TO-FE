import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import ProjectCard from '../domains/project/ProjectCard'
import WorkspaceListSkeleton from '../domains/workspace/WorkspaceListSkeleton'
import { Button } from '../components/Button'
import ConfirmModal from '../components/ConfirmModal'
import { projectMetaTags } from '../constants/projectLabels'
import { projectStatusLabel } from '../constants/projectStatus'
import type { ProjectSummary } from '../types/project'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'
import {
  useDeleteProjectMutation,
  useLeaveProjectMutation,
  useProjectsQuery,
  useToggleProjectPinMutation,
} from '../queries/projects'

export default function WorkspacePage() {
  const projectsQuery = useProjectsQuery()
  const pinMutation = useToggleProjectPinMutation()
  const deleteMutation = useDeleteProjectMutation()
  const leaveMutation = useLeaveProjectMutation()

  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)
  const [leaveTarget, setLeaveTarget] = useState<ProjectSummary | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const projects = projectsQuery.data ?? []
  const loading = projectsQuery.isPending
  const error = projectsQuery.isError
    ? projectsQuery.error instanceof ApiError
      ? projectsQuery.error.message
      : '프로젝트 목록을 불러오지 못했습니다.'
    : null

  const handleTogglePin = (project: ProjectSummary) => {
    pinMutation.mutate({ projectId: project.id, next: !project.isPinned })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    deleteMutation.mutate(targetId, {
      onSuccess: () => {
        setDeleteTarget(null)
        setActionError(null)
      },
      onError: (err) => {
        setDeleteTarget(null)
        setActionError(err instanceof ApiError ? err.message : '프로젝트를 삭제하지 못했습니다.')
      },
    })
  }

  const confirmLeave = () => {
    if (!leaveTarget) return
    const targetId = leaveTarget.id
    leaveMutation.mutate(targetId, {
      onSuccess: () => {
        setLeaveTarget(null)
        setActionError(null)
      },
      onError: (err) => {
        setLeaveTarget(null)
        setActionError(err instanceof ApiError ? err.message : '프로젝트에서 나가지 못했습니다.')
      },
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-head-lg text-neutral-11 font-bold">프로젝트 목록</h1>
        <Button
          variant="secondary"
          size="sm"
          width="auto"
          onClick={() => navigate('/workspace/projects/new')}
          className="border-primary text-primary hover:border-primary hover:text-primary hover:bg-main-1 px-3"
        >
          + 추가하기
        </Button>
      </header>

      {loading && <WorkspaceListSkeleton />}

      {!loading && error && <p className="text-body-sm text-warning">{error}</p>}
      {actionError && <p className="text-body-sm text-warning">{actionError}</p>}

      {!loading && !error && projects.length === 0 && (
        <p className="text-body-sm text-neutral-6">아직 등록된 프로젝트가 없어요</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="flex flex-col gap-10">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              statusLabel={projectStatusLabel(project.status)}
              statusVariant={project.status === 'COMPLETED' ? 'ghost' : 'secondary'}
              tags={projectMetaTags(project)}
              progress={project.deadlineProgressPercent ?? undefined}
              members={project.memberPreviewImageUrls.map((src) => ({ src }))}
              isPinned={project.isPinned}
              onTogglePin={() => handleTogglePin(project)}
              relativeTime={
                project.lastActivityAt
                  ? formatDistanceToNow(new Date(project.lastActivityAt), {
                      addSuffix: true,
                      locale: ko,
                    })
                  : undefined
              }
              menuItems={
                project.myPermission === 'ADMIN'
                  ? [
                      {
                        action: 'edit',
                        label: '설정',
                        onClick: () => navigate(`/workspace/projects/${project.id}?view=settings`),
                      },
                      { action: 'delete', onClick: () => setDeleteTarget(project) },
                    ]
                  : [{ action: 'leave', onClick: () => setLeaveTarget(project) }]
              }
              onClick={() => navigate(`/workspace/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="정말 삭제하시겠습니까?"
        description="삭제된 워크스페이스 데이터는 되돌릴 수 없어요"
      />

      <ConfirmModal
        isOpen={leaveTarget !== null}
        onClose={() => setLeaveTarget(null)}
        onConfirm={confirmLeave}
        title={leaveTarget ? `${leaveTarget.title}에서 나가시겠습니까?` : ''}
        confirmText="나가기"
      />
    </section>
  )
}
