import { useEffect, useState } from 'react'
import {
  bookmarkRecruitment,
  getRecommendedRecruitments,
  getRecruitments,
  unbookmarkRecruitment,
} from '../api/recruitments'
import { ApiError } from '../types/api'
import type { Recruitment } from '../types/recruitment'

/** 구인구직 목록 화면 — 추천 공고와 전체 공고를 함께 조회한다 */
export function useRecruitments() {
  const [recommended, setRecommended] = useState<Recruitment[]>([])
  const [jobs, setJobs] = useState<Recruitment[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [recommendedPage, jobPage] = await Promise.all([
          getRecommendedRecruitments(),
          getRecruitments(),
        ])
        if (cancelled) return
        setRecommended(recommendedPage.items)
        setJobs(jobPage.items)
        // 목록 응답의 isBookmarked로 초기 북마크 상태를 구성
        const marked = [...recommendedPage.items, ...jobPage.items]
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

  /** 낙관적 업데이트 — 실패 시 이전 상태로 되돌린다 */
  async function toggleBookmark(recruitmentId: number) {
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
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev)
        if (wasBookmarked) next.add(recruitmentId)
        else next.delete(recruitmentId)
        return next
      })
    }
  }

  return { recommended, jobs, bookmarkedIds, toggleBookmark, loading, error }
}
