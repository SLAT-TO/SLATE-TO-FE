import { format } from 'date-fns'
import HomeBriefingCard from '../domains/home/HomeBriefingCard'
import HomeProjectsSection from '../domains/home/HomeProjectsSection'
import HomeRecommendedJobsSection from '../domains/home/HomeRecommendedJobsSection'
import HomeMiniCalendar from '../domains/home/HomeMiniCalendar'
import HomeTodayScheduleCard from '../domains/home/HomeTodayScheduleCard'
import { useHomeDashboard } from '../hooks/useHomeDashboard'
import { useRecommendedJobs } from '../hooks/useRecommendedJobs'

export default function HomePage() {
  const { projects, briefing, todaySchedules, loading, error } = useHomeDashboard()
  const { jobs, bookmarkedIds, toggleBookmark, loading: jobsLoading, error: jobsError } =
    useRecommendedJobs()

  return (
    <div className="flex flex-col gap-4.75">
      <p className="text-caption-lg text-neutral-6 tracking-[-0.28px]">
        {format(new Date(), 'yyyy년 M월 d일')}
      </p>

      {(error || jobsError) && <p className="text-body-sm text-warning">{error ?? jobsError}</p>}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-[33.04px]">
        <div className="flex min-w-0 flex-1 flex-col">
          <HomeBriefingCard briefing={briefing} loading={loading} />
          <div className="mt-12.5">
            <HomeProjectsSection projects={projects} loading={loading} />
          </div>
          <div className="mt-21.5">
            <HomeRecommendedJobsSection
              jobs={jobs}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              loading={jobsLoading}
            />
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col items-center gap-6 lg:w-66">
          <HomeMiniCalendar />
          <HomeTodayScheduleCard schedules={todaySchedules} loading={loading} />
        </aside>
      </div>
    </div>
  )
}
