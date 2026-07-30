import { useCallback, useState } from 'react'
import {
  createFeedback,
  deleteFeedback,
  getFeedbacks,
  updateFeedback,
  updateFeedbackStatus,
} from '../api/videos'
import { getMe } from '../api/users'
import type { Feedback } from '../types/feedback'

export type FeedbackFilter = 'all' | 'unresolved'

/** 영상 상세의 피드백 목록 · 작성(구간 첨부) · 수정 · 삭제 · 해결 토글을 다루는 훅
 * @param currentTime 영상 플레이어의 현재 재생 시간(초) — "현재 시점 첨부" 버튼에 사용 */
export function useFeedbacks(videoId: number, currentTime: number) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<FeedbackFilter>('all')
  const [newFeedback, setNewFeedback] = useState('')
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [pendingEnd, setPendingEnd] = useState<number | null>(null)
  /** 구간 기록 버튼으로 시작점만 찍고 종료점 대기 중인 상태 */
  const [isCapturingRange, setIsCapturingRange] = useState(false)
  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null)
  const [editingFeedbackContent, setEditingFeedbackContent] = useState('')

  const load = useCallback(async () => {
    const page = await getFeedbacks(videoId)
    setFeedbacks(page.items)
    return page.items
  }, [videoId])

  const clearPendingTime = useCallback(() => {
    setPendingStart(null)
    setPendingEnd(null)
    setIsCapturingRange(false)
  }, [])

  const attachCurrentTime = useCallback(() => {
    setPendingStart(Math.floor(currentTime))
    setPendingEnd(null)
    setIsCapturingRange(false)
  }, [currentTime])

  /** 구간 기록 버튼 — 첫 클릭은 시작점, 재생 위치를 옮긴 뒤 두 번째 클릭은 종료점 */
  const toggleRangeCapture = useCallback(() => {
    setIsCapturingRange((capturing) => {
      if (!capturing) {
        setPendingStart(Math.floor(currentTime))
        setPendingEnd(null)
        return true
      }
      setPendingEnd(Math.floor(currentTime))
      return false
    })
  }, [currentTime])

  const submitFeedback = useCallback(async () => {
    if (!newFeedback.trim()) return
    const created = await createFeedback(videoId, {
      content: newFeedback.trim(),
      startTime: pendingStart ?? undefined,
      endTime: pendingEnd ?? undefined,
    })
    setFeedbacks((prev) => [created, ...prev])
    setNewFeedback('')
    clearPendingTime()
  }, [videoId, newFeedback, pendingStart, pendingEnd, clearPendingTime])

  const toggleResolved = useCallback(async (feedback: Feedback) => {
    const me = await getMe()
    const updated = await updateFeedbackStatus(feedback.feedbackId, {
      userId: me.id,
      status: !feedback.status,
    })
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.feedbackId === updated.feedbackId
          ? { ...f, status: updated.status, updatedAt: updated.updatedAt }
          : f,
      ),
    )
  }, [])

  const removeFeedback = useCallback(async (feedbackId: number) => {
    await deleteFeedback(feedbackId)
    setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== feedbackId))
  }, [])

  const editFeedback = useCallback(async (feedbackId: number, content: string) => {
    const updated = await updateFeedback(feedbackId, { content })
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.feedbackId === updated.feedbackId
          ? { ...f, content: updated.content, updatedAt: updated.updatedAt }
          : f,
      ),
    )
  }, [])

  const startEditFeedback = useCallback((feedback: Feedback) => {
    setEditingFeedbackId(feedback.feedbackId)
    setEditingFeedbackContent(feedback.content)
  }, [])

  const cancelEditFeedback = useCallback(() => {
    setEditingFeedbackId(null)
    setEditingFeedbackContent('')
  }, [])

  const saveEditFeedback = useCallback(
    async (feedbackId: number) => {
      if (!editingFeedbackContent.trim()) return
      await editFeedback(feedbackId, editingFeedbackContent)
      cancelEditFeedback()
    },
    [editingFeedbackContent, editFeedback, cancelEditFeedback],
  )

  const filteredFeedbacks = feedbacks.filter((f) => (filter === 'unresolved' ? !f.status : true))

  return {
    feedbacks,
    filteredFeedbacks,
    filter,
    setFilter,
    newFeedback,
    setNewFeedback,
    pendingStart,
    pendingEnd,
    isCapturingRange,
    editingFeedbackId,
    editingFeedbackContent,
    setEditingFeedbackContent,
    load,
    clearPendingTime,
    attachCurrentTime,
    toggleRangeCapture,
    submitFeedback,
    toggleResolved,
    removeFeedback,
    startEditFeedback,
    cancelEditFeedback,
    saveEditFeedback,
  }
}
