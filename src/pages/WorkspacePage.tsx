import { useCallback, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deleteProject, getProjects, leaveProject, pinProject, unpinProject } from '../api/projects'
import ProjectCard from '../domains/project/ProjectCard'
import ProjectSettingsView from '../domains/workspace/ProjectSettingsView'
import WorkspaceListSkeleton from '../domains/workspace/WorkspaceListSkeleton'
import ConfirmModal from '../components/ConfirmModal'
import Modal from '../components/Modal'
import { projectMetaTags } from '../constants/projectLabels'
import { projectStatusLabel } from '../constants/projectStatus'
import type { ProjectSummary } from '../types/project'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'

export default function WorkspacePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [leaveTarget, setLeaveTarget] = useState<ProjectSummary | null>(null)
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getProjects()
        if (!cancelled) setProjects(result.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '프로젝트 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleTogglePin = useCallback(async (project: ProjectSummary) => {
    const next = !project.isPinned
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, isPinned: next } : p)))
    try {
      const result = next ? await pinProject(project.id) : await unpinProject(project.id)
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPinned: result.isPinned } : p)),
      )
    } catch {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, isPinned: !next } : p)))
    }
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleteError(null)
    } catch (err) {
      setDeleteTarget(null)
      setDeleteError(err instanceof ApiError ? err.message : '프로젝트를 삭제하지 못했습니다.')
    }
  }, [deleteTarget])

  const confirmLeave = useCallback(async () => {
    if (!leaveTarget) return
    try {
      await leaveProject(leaveTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== leaveTarget.id))
      setLeaveTarget(null)
      setLeaveError(null)
    } catch (err) {
      setLeaveTarget(null)
      setLeaveError(err instanceof ApiError ? err.message : '프로젝트에서 나가지 못했습니다.')
    }
  }, [leaveTarget])

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-head-lg text-neutral-11 font-bold">프로젝트 목록</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="border-primary text-primary hover:bg-main-1 rounded-md border px-3 py-1.5 text-sm"
        >
          + 추가하기
        </button>
      </header>

      {loading && <WorkspaceListSkeleton />}

      {!loading && error && <p className="text-body-sm text-warning">{error}</p>}
      {deleteError && <p className="text-body-sm text-warning">{deleteError}</p>}
      {leaveError && <p className="text-body-sm text-warning">{leaveError}</p>}

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
              onTogglePin={() => void handleTogglePin(project)}
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

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        className="max-h-[85vh] w-140 overflow-y-auto"
      >
        <ProjectSettingsView
          mode="create"
          onCancel={() => setCreateOpen(false)}
          onCreated={(created) => navigate(`/workspace/projects/${created.id}`)}
        />
      </Modal>
    </section>
  )
}
