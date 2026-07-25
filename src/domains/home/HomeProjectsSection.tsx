import { Button } from '../../components/Button'
import HomeProjectCard from './HomeProjectCard'
import type { HomeProject } from '../../hooks/useHomeDashboard'
import { navigate } from '../../utils/navigation'

interface HomeProjectsSectionProps {
  projects: HomeProject[]
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
          <Button
            variant="secondary"
            className="w-50"
            onClick={() => navigate('/mypage/project/new')}
          >
            프로젝트 추가
          </Button>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10.5 gap-y-10 sm:grid-cols-2">
          {projects.map(({ project, members }) => (
            <HomeProjectCard key={project.id} project={project} members={members} />
          ))}
        </div>
      )}
    </section>
  )
}
