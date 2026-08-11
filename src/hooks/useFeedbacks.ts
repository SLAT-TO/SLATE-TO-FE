import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { resolveFeedbackActor } from '../domains/workspace/resolveFeedbackActor'
import {
  createFeedback,
  deleteFeedback,
  getFeedbacks,
  updateFeedback,
  updateFeedbackStatus,
} from '../api/videos'
import type { Feedback } from '../types/feedback'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'

export type FeedbackFilter = 'all' | 'unresolved'

/** 영상 상세의 피드백 목록 · 작성(구간 첨부) · 수정 · 삭제 · 해결 토글을 다루는 훅
 * @param getCurrentTime 플레이어 실제 재생 시각(초) — 클릭 시점에 읽어 단일/구간 첨부
 * @param guestId 공유링크로 들어온 게스트가 작성하는 경우 (registerGuest로 발급받은 id) */
export function useFeedbacks(
  videoId: number,
  getCurrentTime: () => number,
  guestId?: number,
  projectId?: number,
) {
  const queryClient = useQueryClient()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<FeedbackFilter>('all')
  const [newFeedback, setNewFeedback] = useState('')
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [pendingEnd, setPendingEnd] = useState<number | null>(null)
  /** 구간 기록 버튼으로 시작점만 찍고 종료점 대기 중인 상태 */
  const [isCapturingRange, setIsCapturingRange] = useState(false)
  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null)
  const [editingFeedbackContent, setEditingFeedbackContent] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [pendingFeedbackActionId, setPendingFeedbackActionId] = useState<number | null>(null)
  const isSubmittingFeedbackRef = useRef(false)
  const pendingFeedbackActionRef = useRef<number | null>(null)

  const load = useCallback(async () => {
    const page = await getFeedbacks(videoId, guestId != null ? { guestId } : undefined)
    setFeedbacks(page.items)
    return page.items
  }, [videoId, guestId])

  const clearPendingTime = useCallback(() => {
    setPendingStart(null)
    setPendingEnd(null)
    setIsCapturingRange(false)
  }, [])

  const refreshProjectActivity = useCallback(() => {
    if (projectId == null) return
    void invalidateProjectActivityData(queryClient, projectId)
  }, [projectId, queryClient])

  const attachCurrentTime = useCallback(() => {
    setPendingStart(Math.floor(getCurrentTime()))
    setPendingEnd(null)
    setIsCapturingRange(false)
  }, [getCurrentTime])

  /** 구간 기록 버튼 — 첫 클릭은 시작점, 재생 위치를 옮긴 뒤 두 번째 클릭은 종료점 */
  const toggleRangeCapture = useCallback(() => {
    const t = Math.floor(getCurrentTime())
    setIsCapturingRange((capturing) => {
      if (!capturing) {
        setPendingStart(t)
        setPendingEnd(null)
        return true
      }
      setPendingEnd(t)
      return false
    })
  }, [getCurrentTime])

  const submitFeedback = useCallback(async () => {
    if (!newFeedback.trim() || isSubmittingFeedbackRef.current) return
    isSubmittingFeedbackRef.current = true
    setIsSubmittingFeedback(true)
    const actor = resolveFeedbackActor(guestId)
    try {
      const created = await createFeedback(videoId, {
        content: newFeedback.trim(),
        startTime: pendingStart ?? undefined,
        endTime: pendingEnd ?? undefined,
        ...actor,
      })
      setFeedbacks((prev) => [created, ...prev])
      setNewFeedback('')
      clearPendingTime()
      refreshProjectActivity()
    } catch {
      window.alert('피드백을 등록하지 못했습니다. 다시 시도해주세요.')
    } finally {
      isSubmittingFeedbackRef.current = false
      setIsSubmittingFeedback(false)
    }
  }, [
    videoId,
    newFeedback,
    pendingStart,
    pendingEnd,
    guestId,
    clearPendingTime,
    refreshProjectActivity,
  ])

  /** 체크 아이콘 토글 — UI 먼저 반영 후 status API 호출 (실패 시 롤백) */
  const beginFeedbackAction = useCallback((feedbackId: number) => {
    if (pendingFeedbackActionRef.current != null) return false
    pendingFeedbackActionRef.current = feedbackId
    setPendingFeedbackActionId(feedbackId)
    return true
  }, [])

  const endFeedbackAction = useCallback(() => {
    pendingFeedbackActionRef.current = null
    setPendingFeedbackActionId(null)
  }, [])

  const toggleResolved = useCallback(
    async (feedback: Feedback) => {
      if (!beginFeedbackAction(feedback.feedbackId)) return
      const nextStatus = !feedback.status
      setFeedbacks((prev) =>
        prev.map((f) => (f.feedbackId === feedback.feedbackId ? { ...f, status: nextStatus } : f)),
      )
      try {
        const updated = await updateFeedbackStatus(feedback.feedbackId, {
          status: nextStatus,
        })
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.feedbackId === updated.feedbackId
              ? { ...f, status: updated.status, updatedAt: updated.updatedAt }
              : f,
          ),
        )
      } catch {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.feedbackId === feedback.feedbackId ? { ...f, status: feedback.status } : f,
          ),
        )
        window.alert('피드백 상태를 변경하지 못했습니다. 다시 시도해주세요.')
      } finally {
        endFeedbackAction()
      }
    },
    [beginFeedbackAction, endFeedbackAction],
  )

  const removeFeedback = useCallback(
    async (feedbackId: number) => {
      if (!beginFeedbackAction(feedbackId)) return
      const actor = resolveFeedbackActor(guestId)
      try {
        await deleteFeedback(feedbackId, actor)
        setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== feedbackId))
      } catch {
        window.alert('피드백을 삭제하지 못했습니다. 다시 시도해주세요.')
      } finally {
        endFeedbackAction()
      }
    },
    [guestId, beginFeedbackAction, endFeedbackAction],
  )

  const editFeedback = useCallback(
    async (feedbackId: number, content: string) => {
      const actor = resolveFeedbackActor(guestId)
      const updated = await updateFeedback(feedbackId, { content, ...actor })
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.feedbackId === updated.feedbackId
            ? { ...f, content: updated.content, updatedAt: updated.updatedAt }
            : f,
        ),
      )
    },
    [guestId],
  )

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
      if (!beginFeedbackAction(feedbackId)) return
      try {
        await editFeedback(feedbackId, editingFeedbackContent)
        cancelEditFeedback()
      } catch {
        window.alert('피드백을 수정하지 못했습니다. 다시 시도해주세요.')
      } finally {
        endFeedbackAction()
      }
    },
    [
      editingFeedbackContent,
      editFeedback,
      cancelEditFeedback,
      beginFeedbackAction,
      endFeedbackAction,
    ],
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
    isSubmittingFeedback,
    pendingFeedbackActionId,
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
