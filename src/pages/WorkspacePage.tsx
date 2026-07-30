import { useCallback, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deleteProject, getProjects, leaveProject, pinProject, unpinProject } from '../api/projects'
import ProjectCard from '../domains/project/ProjectCard'
import ConfirmModal from '../components/ConfirmModal'
import { projectMetaTags } from '../constants/projectLabels'
import { projectStatusLabel } from '../constants/projectStatus'
import type { ProjectSummary } from '../types/project'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'

type ConfirmTarget = {
  project: ProjectSummary
  kind: 'delete' | 'leave'
}

export default function WorkspacePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const confirmAction = useCallback(async () => {
    if (!confirmTarget) return
    const { project, kind } = confirmTarget
    try {
      if (kind === 'delete') {
        await deleteProject(project.id)
      } else {
        await leaveProject(project.id)
      }
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
      setConfirmTarget(null)
      setActionError(null)
    } catch (err) {
      setConfirmTarget(null)
      setActionError(
        err instanceof ApiError
          ? err.message
          : kind === 'delete'
            ? '프로젝트를 삭제하지 못했습니다.'
            : '워크스페이스에서 나가지 못했습니다.',
      )
    }
  }, [confirmTarget])

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-head-lg text-neutral-11 font-bold">프로젝트 목록</h1>
        <button
          type="button"
          onClick={() => navigate('/mypage/project/new')}
          className="border-primary text-primary hover:bg-primary/5 text-body-sm flex items-center gap-1 rounded-lg border px-4 py-2 font-semibold"
        >
          + 추가하기
        </button>
      </header>

      {loading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {error && <p className="text-body-sm text-warning">{error}</p>}
      {actionError && <p className="text-body-sm text-warning">{actionError}</p>}

      {!loading && !error && (
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
                        action: 'settings',
                        onClick: () => navigate(`/workspace/projects/${project.id}?view=settings`),
                      },
                      {
                        action: 'delete',
                        onClick: () => setConfirmTarget({ project, kind: 'delete' }),
                      },
                    ]
                  : [
                      {
                        action: 'leave',
                        onClick: () => setConfirmTarget({ project, kind: 'leave' }),
                      },
                    ]
              }
              onClick={() => navigate(`/workspace/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={confirmAction}
        title={
          confirmTarget?.kind === 'delete' ? '프로젝트를 삭제할까요?' : '워크스페이스에서 나갈까요?'
        }
        description={
          confirmTarget?.kind === 'delete'
            ? '삭제한 프로젝트는 복구할 수 없습니다.'
            : '다시 참여하려면 초대가 필요합니다.'
        }
      />
    </section>
  )
}
