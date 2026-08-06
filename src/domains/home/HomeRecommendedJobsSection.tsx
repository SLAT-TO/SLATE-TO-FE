import JobCard from '../../components/JobCard'
import type { Recruitment } from '../../types/recruitment'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'

interface HomeRecommendedJobsSectionProps {
  jobs: Recruitment[]
  bookmarkedIds: Set<number>
  onToggleBookmark: (recruitmentId: number) => void
  loading: boolean
}

const ROLE_LABEL_MAP: Record<string, string> = {
  DIRECTOR: '연출',
  EDITOR: '편집',
  CINEMATOGRAPHER: '촬영 감독',
  SOUND: '사운드',
  PD: 'PD',
  ART: '미술',
}

export default function HomeRecommendedJobsSection({
  jobs,
  bookmarkedIds,
  onToggleBookmark,
  loading,
}: HomeRecommendedJobsSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">추천 공고</h2>

      {loading && <p className="text-caption-sm text-neutral-6">불러오는 중…</p>}

      {!loading && jobs.length === 0 && (
        <p className="text-caption-sm text-neutral-6">추천 공고가 없어요.</p>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10.5 gap-y-5 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              category={PROJECT_TYPE_LABEL[job.categories[0]] ?? job.categories[0] ?? '기타'}
              length={
                job.lengthType
                  ? (PROJECT_LENGTH_TYPE_LABEL[job.lengthType] ?? job.lengthType)
                  : undefined
              }
              title={job.title}
              description={job.description}
              role={ROLE_LABEL_MAP[job.roles[0]] ?? job.roles[0] ?? '전체'}
              dDay={job.status === 'OPEN' ? '상시모집' : '마감'}
              isBookmarked={bookmarkedIds.has(job.id)}
              onBookmarkClick={() => onToggleBookmark(job.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
