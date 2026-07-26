import { useState } from 'react'
import JobCard from '../components/JobCard'
import HeaderTitle from '../components/HeaderTitle'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { navigate } from '../utils/navigation'
import { MOCK_BOOKMARKED, MOCK_MY_POSTS, MOCK_APPLIED } from '../domains/recruit/mockMyRecruit'
import type { JobPost } from '../types/Recruit.types'

const HEADER = <HeaderTitle>나의 구인구직</HeaderTitle>

function MyRecruitPage() {
  useHeaderSlot(HEADER)

  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(
    MOCK_BOOKMARKED.map((post) => post.id),
  )

  const handleToggleBookmark = (id: number) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const renderSection = (title: string, posts: JobPost[]) => (
    <section className="flex flex-col gap-4">
      <h2 className="text-head-sm text-neutral-11 font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <JobCard
            key={post.id}
            {...post}
            isBookmarked={bookmarkedIds.includes(post.id)}
            onBookmarkClick={() => handleToggleBookmark(post.id)}
            onClick={() => navigate(`/matching/${post.id}`)}
          />
        ))}
      </div>
    </section>
  )

  return (
    <div className="flex flex-col gap-10 py-6">
      {renderSection('관심 있는 공고', MOCK_BOOKMARKED)}
      {renderSection('내가 올린 공고', MOCK_MY_POSTS)}
      {renderSection('내가 지원한 공고', MOCK_APPLIED)}
    </div>
  )
}

export default MyRecruitPage
