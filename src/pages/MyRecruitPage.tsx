import { useCallback, useState } from 'react'
import JobCard from '../components/JobCard'
import HeaderTitle from '../components/HeaderTitle'
import BookmarkModal from '../domains/recruit/BookmarkModal'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { useMyRecruitments } from '../hooks/useMyRecruitments'
import { navigate } from '../utils/navigation'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../constants/projectLabels'
import { roleLabel } from '../constants/roles'
import type { Recruitment } from '../types/recruitment'
import JobCardSkeleton from '../domains/recruit/JobCardSkeleton'

const HEADER = <HeaderTitle>나의 구인구직</HeaderTitle>

function MyRecruitPage() {
  useHeaderSlot(HEADER)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const { bookmarked, myPosts, applied, bookmarkedIds, toggleBookmark, loading, error } =
    useMyRecruitments()

  // 등록 시에만 안내 모달을 띄운다 (해제 시엔 없음)
  // JobCard가 React.memo로 감싸져 있어 — useCallback으로 안정된 참조를 넘겨야 카드별 리렌더가 줄어든다
  const handleBookmarkClick = useCallback(
    (id: number) => {
      void (async () => {
        const nowBookmarked = await toggleBookmark(id)
        if (nowBookmarked) setIsBookmarkModalOpen(true)
      })()
    },
    [toggleBookmark],
  )

  const handleCardClick = useCallback((id: number) => {
    navigate(`/matching/${id}`)
  }, [])

  const renderSection = (title: string, posts: Recruitment[]) => (
    <section className="flex flex-col gap-4">
      <h2 className="text-head-sm text-neutral-11 font-bold">{title}</h2>
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2" role="status" aria-busy="true">
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-caption-sm text-neutral-6">공고가 없어요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <JobCard
              key={post.id}
              id={post.id}
              category={PROJECT_TYPE_LABEL[post.category] ?? post.category}
              length={
                post.lengthType
                  ? (PROJECT_LENGTH_TYPE_LABEL[post.lengthType] ?? post.lengthType)
                  : undefined
              }
              title={post.title}
              role={roleLabel(post.recruitPart)}
              dDay={post.status === 'CLOSED' ? '마감' : `D-${post.dday}`}
              isBookmarked={bookmarkedIds.has(post.id)}
              onBookmarkClick={handleBookmarkClick}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </section>
  )

  if (error) {
    return <p className="text-body-sm text-neutral-6 py-6">{error}</p>
  }

  return (
    <div className="flex flex-col gap-10 py-6">
      {renderSection('관심 있는 공고', bookmarked)}
      {renderSection('내가 올린 공고', myPosts)}
      {renderSection('내가 지원한 공고', applied)}
      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
    </div>
  )
}

export default MyRecruitPage
