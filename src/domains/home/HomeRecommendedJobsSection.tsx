import { useCallback } from 'react'
import JobCard from '../../components/JobCard'
import type { Recruitment } from '../../types/recruitment'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'
import { roleLabel } from '../../constants/roles'
import { navigate } from '../../utils/navigation'

interface HomeRecommendedJobsSectionProps {
  jobs: Recruitment[]
  bookmarkedIds: Set<number>
  onToggleBookmark: (recruitmentId: number) => void
  loading: boolean
}

function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border-input bg-neutral-2 h-40 rounded-xl border-[0.749px]"
    />
  )
}

export default function HomeRecommendedJobsSection({
  jobs,
  bookmarkedIds,
  onToggleBookmark,
  loading,
}: HomeRecommendedJobsSectionProps) {
  const handleCardClick = useCallback((jobId: number) => {
    navigate(`/matching/${jobId}`)
  }, [])

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-head-sm text-neutral-11 font-bold">추천 공고</h2>
        <button
          type="button"
          onClick={() => navigate('/matching')}
          className="text-body-sm text-neutral-11 font-semibold tracking-[-0.32px] capitalize"
        >
          전체 보기
        </button>
      </div>

      {loading && (
        <div
          className="grid grid-cols-1 gap-x-10.5 gap-y-5 sm:grid-cols-2"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label="추천 공고 불러오는 중"
        >
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <p className="text-caption-sm text-neutral-6">추천 공고가 없어요.</p>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10.5 gap-y-5 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              category={PROJECT_TYPE_LABEL[job.category] ?? job.category}
              length={
                job.lengthType
                  ? (PROJECT_LENGTH_TYPE_LABEL[job.lengthType] ?? job.lengthType)
                  : undefined
              }
              title={job.title}
              role={roleLabel(job.recruitPart)}
              dDay={job.status === 'CLOSED' ? '마감' : `D-${job.dday}`}
              isBookmarked={bookmarkedIds.has(job.id)}
              onBookmarkClick={onToggleBookmark}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </section>
  )
}
