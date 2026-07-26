import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deleteProject, getProjects, pinProject, unpinProject } from '../api/projects'
import ProjectCard from '../domains/project/ProjectCard'
import ConfirmModal from '../components/ConfirmModal'
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

  const handleTogglePin = async (project: ProjectSummary) => {
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
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteProject(deleteTarget.id)
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-head-lg text-neutral-11 font-bold">프로젝트 목록</h1>
      </header>

      {loading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {error && <p className="text-body-sm text-warning">{error}</p>}

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
              menuItems={[
                {
                  action: 'edit',
                  onClick: () => navigate(`/workspace/projects/${project.id}?view=settings`),
                },
                { action: 'delete', onClick: () => setDeleteTarget(project) },
              ]}
              onClick={() => navigate(`/workspace/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="프로젝트를 삭제할까요?"
        description="삭제한 프로젝트는 복구할 수 없습니다."
      />
    </section>
  )
}
