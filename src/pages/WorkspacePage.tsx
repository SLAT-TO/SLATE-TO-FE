import { useEffect, useState } from 'react'
import { getProjects } from '../api/projects'
import { projectMetaTags } from '../constants/projectLabels'
import { projectStatusLabel } from '../constants/projectStatus'
import type { Project } from '../types/project'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'

export default function WorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getProjects()
        if (!cancelled) setProjects(result)
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
        <ul className="border-border divide-border divide-y border-y">
          {projects.map((project) => {
            const tags = projectMetaTags(project)
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/workspace/projects/${project.id}`)}
                  className="hover:bg-neutral-2 flex w-full items-start justify-between gap-4 px-1 py-4 text-left"
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-body-sm text-neutral-11 font-medium">
                      {project.title}
                    </span>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-main-1 text-main-6 text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="bg-main-1 text-main-7 text-caption-sm shrink-0 rounded-[3px] px-[19px] py-1 font-semibold">
                    {projectStatusLabel(project.status)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
