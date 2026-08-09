import { useEffect, useState } from 'react'
import {
  bookmarkRecruitment,
  getMyApplications,
  getMyRecruitmentBookmarks,
  getMyRecruitments,
  unbookmarkRecruitment,
} from '../api/recruitments'
import { ApiError } from '../types/api'
import type { AppliedRecruitment, Recruitment } from '../types/recruitment'

/** 나의 구인구직 — 관심·내가 올린·내가 지원한 공고를 함께 조회한다 */
export function useMyRecruitments() {
  const [bookmarked, setBookmarked] = useState<Recruitment[]>([])
  const [myPosts, setMyPosts] = useState<Recruitment[]>([])
  const [applied, setApplied] = useState<AppliedRecruitment[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [bookmarkPage, myPage, appliedPage] = await Promise.all([
          getMyRecruitmentBookmarks(),
          getMyRecruitments(),
          getMyApplications(),
        ])
        if (cancelled) return
        setBookmarked(bookmarkPage.items)
        setMyPosts(myPage.items)
        setApplied(appliedPage.items)
        const marked = [...bookmarkPage.items, ...myPage.items, ...appliedPage.items]
          .filter((r) => r.isBookmarked)
          .map((r) => r.id)
        setBookmarkedIds(new Set(marked))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '공고를 불러오지 못했습니다.')
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

  /** 낙관적 업데이트 — 실패 시 되돌린다. 등록 여부를 반환해 모달 노출 판단에 쓴다 */
  async function toggleBookmark(recruitmentId: number): Promise<boolean> {
    const wasBookmarked = bookmarkedIds.has(recruitmentId)

    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (wasBookmarked) next.delete(recruitmentId)
      else next.add(recruitmentId)
      return next
    })

    try {
      if (wasBookmarked) await unbookmarkRecruitment(recruitmentId)
      else await bookmarkRecruitment(recruitmentId)
      return !wasBookmarked
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev)
        if (wasBookmarked) next.add(recruitmentId)
        else next.delete(recruitmentId)
        return next
      })
      return wasBookmarked
    }
  }

  return { bookmarked, myPosts, applied, bookmarkedIds, toggleBookmark, loading, error }
}
