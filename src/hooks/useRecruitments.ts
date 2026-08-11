import { useEffect, useState } from 'react'
import {
  bookmarkRecruitment,
  getAllRecruitments,
  getRecommendedRecruitments,
  unbookmarkRecruitment,
} from '../api/recruitments'
import { ApiError } from '../types/api'
import type { Recruitment } from '../types/recruitment'
import { SORT_PARAM } from '../constants/recruitFilters'
import type { SortValue } from '../constants'
import { toRecruitmentListParams } from '../utils/recruitFilterParams'
import type { SelectedFilters } from '../types/Recruit.types'

/** 구인구직 목록 화면 — 추천 공고와 전체 공고를 함께 조회한다 */
export function useRecruitments(sort: SortValue, filters: SelectedFilters) {
  const [recommended, setRecommended] = useState<Recruitment[]>([])
  const [jobs, setJobs] = useState<Recruitment[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paramsKey = JSON.stringify(toRecruitmentListParams(filters))

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [recommendedPage, jobs] = await Promise.all([
          getRecommendedRecruitments(),
          getAllRecruitments({ ...JSON.parse(paramsKey), sort: SORT_PARAM[sort] }),
        ])
        if (cancelled) return
        setRecommended(recommendedPage.items)
        setJobs(jobs)

        const marked = [...recommendedPage.items, ...jobs]
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
  }, [sort, paramsKey])

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
