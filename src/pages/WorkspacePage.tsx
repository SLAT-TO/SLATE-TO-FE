import { useEffect, useState } from 'react'
import { getProjects } from '../api/projects'
import ProjectCard from '../domains/project/ProjectCard'
import { projectMetaTags } from '../constants/projectLabels'
import { projectStatusLabel } from '../constants/projectStatus'
import type { ProjectSummary } from '../types/project'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'

export default function WorkspacePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-head-lg text-neutral-11 font-bold">프로젝트 목록</h1>
      </header>

      {loading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}
      {error && <p className="text-body-sm text-warning">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p className="text-body-sm text-neutral-6">프로젝트가 없습니다.</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10.5 gap-y-10 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              statusLabel={projectStatusLabel(project.status)}
              statusVariant={project.status === 'COMPLETED' ? 'ghost' : 'secondary'}
              tags={projectMetaTags(project)}
              progress={project.deadlineProgressPercent ?? undefined}
              members={project.memberPreviewImageUrls.map((src) => ({ src }))}
              onClick={() => navigate(`/workspace/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
