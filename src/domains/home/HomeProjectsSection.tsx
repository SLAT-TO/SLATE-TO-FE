import HomeProjectCard from './HomeProjectCard'
import type { ProjectSummary } from '../../types/project'
import { navigate } from '../../utils/navigation'

interface HomeProjectsSectionProps {
  projects: ProjectSummary[]
  loading: boolean
}

export default function HomeProjectsSection({ projects, loading }: HomeProjectsSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">진행 중인 프로젝트</h2>

      {loading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}

      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="text-body-sm text-neutral-6">
            진행중인 프로젝트가 없어요. 프로젝트를 추가해보세요.
          </p>
          <a
            href="/mypage/project/new"
            onClick={(e) => {
              e.preventDefault()
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
            <HomeProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}
