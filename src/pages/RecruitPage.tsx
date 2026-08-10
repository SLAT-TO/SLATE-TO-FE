import { useState } from 'react'
import JobCard from '../components/JobCard'
import JobFilterBar from '../domains/recruit/JobFilterBar'
import { FILTER_CONFIGS, type SortValue } from '../constants'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../constants/projectLabels'
import { roleLabel } from '../constants/roles'
import type { FilterCategory, SelectedFilterChip, SelectedFilters } from '../types/Recruit.types'
import type { Recruitment } from '../types/recruitment'
import { useRecruitments } from '../hooks/useRecruitments'
import { navigate } from '../utils/navigation'
import BookmarkModal from '../domains/recruit/BookmarkModal'

const INITIAL_FILTERS: SelectedFilters = { region: [], videoType: [], role: [] }

/** 추천 공고는 2x2 그리드로 4개까지 노출 */
const RECOMMENDED_LIMIT = 4

function RecruitPage() {
  const [sort, setSort] = useState<SortValue>('latest')
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(INITIAL_FILTERS)
  const [openCategory, setOpenCategory] = useState<FilterCategory | null>(null)
  const { recommended, jobs, bookmarkedIds, toggleBookmark, loading, error } = useRecruitments(sort)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)

  const handleToggleFilter = (category: FilterCategory, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category]
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      }
    })
  }

  const handleBookmarkClick = (job: Recruitment) => {
    const willBookmark = !bookmarkedIds.has(job.id)
    void toggleBookmark(job.id)
    if (willBookmark) setIsBookmarkModalOpen(true)
  }

  // 칩 순서는 필터 바 버튼 순서(지역 → 영상 → 역할)를 따름
  const chips: SelectedFilterChip[] = FILTER_CONFIGS.flatMap((config) =>
    selectedFilters[config.key].map((value) => ({ category: config.key, value })),
  )

  const renderCard = (job: Recruitment) => (
    <JobCard
      key={job.id}
      category={PROJECT_TYPE_LABEL[job.category] ?? job.category}
      length={
        job.lengthType ? (PROJECT_LENGTH_TYPE_LABEL[job.lengthType] ?? job.lengthType) : undefined
      }
      title={job.title}
      role={roleLabel(job.recruitPart)}
      dDay={job.status === 'CLOSED' ? '마감' : `D-${job.dday}`}
      isBookmarked={bookmarkedIds.has(job.id)}
      onBookmarkClick={() => handleBookmarkClick(job)}
      onClick={() => navigate(`/matching/${job.id}`)}
    />
  )

  if (error) {
    return <p className="text-body-sm text-neutral-6">{error}</p>
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-head-sm text-neutral-11 font-bold">추천공고</h2>
        {loading ? (
          <p className="text-caption-sm text-neutral-6">불러오는 중…</p>
        ) : recommended.length === 0 ? (
          <p className="text-caption-sm text-neutral-6">추천 공고가 없어요.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {recommended.slice(0, RECOMMENDED_LIMIT).map(renderCard)}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-head-sm text-neutral-11 font-bold">전체 공고</h2>

        <JobFilterBar
          sort={sort}
          onSortChange={setSort}
          selectedFilters={selectedFilters}
          onToggleFilter={handleToggleFilter}
          openCategory={openCategory}
          onOpenCategoryChange={setOpenCategory}
          chips={chips}
          onCreatePost={() => navigate('/matching/new')}
        />

        {loading ? (
          <p className="text-caption-sm text-neutral-6">불러오는 중…</p>
        ) : jobs.length === 0 ? (
          <p className="text-caption-sm text-neutral-6">등록된 공고가 없어요.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">{jobs.map(renderCard)}</div>
        )}
      </section>
      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
    </div>
  )
}

export default RecruitPage
