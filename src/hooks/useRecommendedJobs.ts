import { useEffect, useState } from 'react'
import {
  bookmarkRecruitment,
  getMyRecruitmentBookmarks,
  getRecommendedRecruitments,
  unbookmarkRecruitment,
} from '../api/recruitments'
import { ApiError } from '../types/api'
import type { Recruitment } from '../types/recruitment'

export function useRecommendedJobs() {
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
        const [recommended, bookmarks] = await Promise.all([
          getRecommendedRecruitments(),
          getMyRecruitmentBookmarks().catch(() => ({ items: [] as Recruitment[] })),
        ])
        if (cancelled) return
        setJobs(recommended.items)
        setBookmarkedIds(new Set(bookmarks.items.map((r) => r.id)))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '추천 공고를 불러오지 못했습니다.')
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

  return { jobs, bookmarkedIds, toggleBookmark, loading, error }
}
