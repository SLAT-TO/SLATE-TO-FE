import { useEffect, useState } from 'react'
import { bookmarkRecruitment, getRecruitment, unbookmarkRecruitment } from '../api/recruitments'
import { ApiError } from '../types/api'
import type { RecruitmentDetailResponse } from '../types/recruitment'

export function useRecruitmentDetail(recruitmentId: number) {
  const [detail, setDetail] = useState<RecruitmentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getRecruitment(recruitmentId)
        if (!cancelled) setDetail(result)
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
  }, [recruitmentId])

  /** 낙관적 업데이트 — 실패 시 되돌린다. 등록 여부를 반환해 모달 노출 판단에 쓴다 */
  async function toggleBookmark(): Promise<boolean> {
    if (!detail) return false
    const wasBookmarked = detail.isBookmarked

    setDetail((prev) => (prev ? { ...prev, isBookmarked: !wasBookmarked } : prev))

    try {
      if (wasBookmarked) await unbookmarkRecruitment(detail.id)
      else await bookmarkRecruitment(detail.id)
      return !wasBookmarked
    } catch {
      setDetail((prev) => (prev ? { ...prev, isBookmarked: wasBookmarked } : prev))
      return wasBookmarked
    }
  }

  return { detail, toggleBookmark, loading, error }
}
