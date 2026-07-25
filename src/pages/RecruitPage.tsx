import { useState } from 'react'
import JobCard from '../components/JobCard'
import JobFilterBar from '../domains/recruit/JobFilterBar'
import { MOCK_JOB_POSTS, MOCK_RECOMMENDED_POSTS } from '../domains/recruit/mockJobPosts'
import { FILTER_CONFIGS, type SortValue } from '../constants'
import type { FilterCategory, SelectedFilterChip, SelectedFilters } from '../types/Recruit.types'

const INITIAL_FILTERS: SelectedFilters = { region: [], videoType: [], role: [] }

function RecruitPage() {
  const [sort, setSort] = useState<SortValue>('latest')
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(INITIAL_FILTERS)
  const [openCategory, setOpenCategory] = useState<FilterCategory | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])

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

  const handleToggleBookmark = (id: number) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  // 칩 순서는 필터 바 버튼 순서(지역 → 영상 → 역할)를 따름
  const chips: SelectedFilterChip[] = FILTER_CONFIGS.flatMap((config) =>
    selectedFilters[config.key].map((value) => ({ category: config.key, value })),
  )

  // API 연동 시 sort/selectedFilters를 쿼리 파라미터로 전달하고 서버 필터링으로 교체
  const jobPosts = MOCK_JOB_POSTS

  return (
    <div className="flex flex-col gap-10 px-8 py-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-caption-lg text-neutral-11 font-semibold">관심 있는 공고</h2>
        <div className="grid grid-cols-2 gap-6">
          {MOCK_RECOMMENDED_POSTS.map((post) => (
            <JobCard
              key={post.id}
              {...post}
              isBookmarked={bookmarkedIds.includes(post.id)}
              onBookmarkClick={() => handleToggleBookmark(post.id)}
            />
          ))}
        </div>
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
        />

        <div className="flex justify-end">
          {/* TODO: 공고 작성 페이지(후속 이슈) 연결 */}
          <button
            type="button"
            className="border-primary text-primary text-caption-lg hover:bg-main-1 flex items-center gap-2 rounded-lg border bg-white px-5 py-2.5"
          >
            <span aria-hidden>+</span>
            공고 올리기
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {jobPosts.map((post) => (
            <JobCard
              key={post.id}
              {...post}
              isBookmarked={bookmarkedIds.includes(post.id)}
              onBookmarkClick={() => handleToggleBookmark(post.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default RecruitPage
