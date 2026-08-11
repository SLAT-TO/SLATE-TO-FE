import { useState } from 'react'
import HomeProjectCard from './HomeProjectCard'
import ConfirmModal from '../../components/ConfirmModal'
import type { ProjectSummary } from '../../types/project'
import { navigate } from '../../utils/navigation'

interface HomeProjectsSectionProps {
  projects: ProjectSummary[]
  loading: boolean
  onTogglePin: (project: ProjectSummary) => void
  onDeleteProject: (projectId: number) => Promise<void>
  onLeaveProject: (projectId: number) => Promise<void>
}

function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border-input bg-neutral-2 h-34 rounded-[10.242px] border-[0.749px]"
    />
  )
}

export default function HomeProjectsSection({
  projects,
  loading,
  onTogglePin,
  onDeleteProject,
  onLeaveProject,
}: HomeProjectsSectionProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [leaveTarget, setLeaveTarget] = useState<ProjectSummary | null>(null)
  const [leaveError, setLeaveError] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await onDeleteProject(deleteTarget.id)
      setDeleteTarget(null)
      setDeleteError(null)
    } catch {
      setDeleteTarget(null)
      setDeleteError('프로젝트를 삭제하지 못했습니다.')
    }
  }

  const confirmLeave = async () => {
    if (!leaveTarget) return
    try {
      await onLeaveProject(leaveTarget.id)
      setLeaveTarget(null)
      setLeaveError(null)
    } catch {
      setLeaveTarget(null)
      setLeaveError('프로젝트에서 나가지 못했습니다.')
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-head-sm text-neutral-11 font-bold">진행 중인 프로젝트</h2>
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="text-body-sm text-neutral-11 font-semibold tracking-[-0.32px] capitalize"
        >
          전체 보기
        </button>
      </div>

      {loading && (
        <div
          className="grid grid-cols-1 gap-x-10.5 gap-y-10 sm:grid-cols-2"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label="프로젝트 목록 불러오는 중"
        >
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}
      {deleteError && <p className="text-body-sm text-warning">{deleteError}</p>}
      {leaveError && <p className="text-body-sm text-warning">{leaveError}</p>}

      {!loading && projects.length === 0 && (
        <div className="flex h-46 flex-col items-center justify-center gap-5 rounded-[10.242px] bg-white shadow-[0px_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
          <p className="text-body-sm text-neutral-6">
            진행중인 프로젝트가 없어요. 프로젝트를 추가해보세요.
          </p>
          <a
            href="/mypage/project/new"
            onClick={(event) => {
              event.preventDefault()
              navigate('/mypage/project/new')
            }}
            className="border-secondary text-secondary hover:border-secondary-hover hover:text-secondary-hover inline-flex h-10 w-50 items-center justify-center gap-2.5 rounded-lg border bg-white px-4 text-base font-semibold tracking-[-0.176px] transition-colors"
          >
            프로젝트 추가
          </a>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10.5 gap-y-10 sm:grid-cols-2">
          {projects.map((project) => (
            <HomeProjectCard
              key={project.id}
              project={project}
              onTogglePin={() => onTogglePin(project)}
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
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="정말 삭제하시겠습니까?"
        description="삭제된 워크스페이스 데이터는 되돌릴 수 없어요"
      />

      <ConfirmModal
        isOpen={leaveTarget !== null}
        onClose={() => setLeaveTarget(null)}
        onConfirm={() => void confirmLeave()}
        title={leaveTarget ? `${leaveTarget.title}에서 나가시겠습니까?` : ''}
        confirmText="나가기"
      />
    </section>
  )
}
