import { useCallback, useState } from 'react'
import { createReply, getReplies } from '../api/videos'
import type { FeedbackReply } from '../types/feedback'

/** 피드백 답글 펼침/목록/작성(구간 첨부)을 다루는 훅
 * @param currentTime 영상 플레이어의 현재 재생 시간(초) — "현재 시점 첨부" 버튼에 사용
 * @param guestId 공유링크로 들어온 게스트가 작성하는 경우 (registerGuest로 발급받은 id) */
export function useFeedbackReplies(currentTime: number, guestId?: number) {
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [newReply, setNewReply] = useState('')
  const [replyPendingStart, setReplyPendingStart] = useState<number | null>(null)
  const [replyPendingEnd, setReplyPendingEnd] = useState<number | null>(null)
  /** 답글의 구간 기록 버튼으로 시작점만 찍고 종료점 대기 중인 상태 */
  const [isCapturingReplyRange, setIsCapturingReplyRange] = useState(false)

  const clearReplyPendingTime = useCallback(() => {
    setReplyPendingStart(null)
    setReplyPendingEnd(null)
    setIsCapturingReplyRange(false)
  }, [])

  /** 답글 입력창을 다른 피드백으로 옮기거나 닫을 때 이전에 쓰던 텍스트·시간 첨부 상태가 남지 않도록 초기화 */
  const resetReplyCompose = useCallback(() => {
    setNewReply('')
    clearReplyPendingTime()
  }, [clearReplyPendingTime])

  const toggleReplies = useCallback(
    async (feedbackId: number) => {
      if (expandedFeedbackId === feedbackId) {
        setExpandedFeedbackId(null)
        resetReplyCompose()
        return
      }
      setExpandedFeedbackId(feedbackId)
      resetReplyCompose()
      setRepliesByFeedback((prev) => {
        if (prev[feedbackId]) return prev
        void getReplies(feedbackId).then((page) => {
          setRepliesByFeedback((p) => ({ ...p, [feedbackId]: page.items }))
        })
        return prev
      })
    },
    [expandedFeedbackId, resetReplyCompose],
  )

  const attachReplyCurrentTime = useCallback(() => {
    setReplyPendingStart(Math.floor(currentTime))
    setReplyPendingEnd(null)
    setIsCapturingReplyRange(false)
  }, [currentTime])

  /** 답글 구간 기록 버튼 — 첫 클릭은 시작점, 재생 위치를 옮긴 뒤 두 번째 클릭은 종료점 */
  const toggleReplyRangeCapture = useCallback(() => {
    setIsCapturingReplyRange((capturing) => {
      if (!capturing) {
        setReplyPendingStart(Math.floor(currentTime))
        setReplyPendingEnd(null)
        return true
      }
      setReplyPendingEnd(Math.floor(currentTime))
      return false
    })
  }, [currentTime])

  const submitReply = useCallback(
    async (feedbackId: number) => {
      if (!newReply.trim()) return
      const created = await createReply(feedbackId, {
        content: newReply.trim(),
        startTime: replyPendingStart ?? undefined,
        endTime: replyPendingEnd ?? undefined,
        guestId,
      })
      setRepliesByFeedback((prev) => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] ?? []), created],
      }))
      resetReplyCompose()
    },
    [newReply, replyPendingStart, replyPendingEnd, guestId, resetReplyCompose],
  )

  return {
    expandedFeedbackId,
    repliesByFeedback,
    newReply,
    setNewReply,
    replyPendingStart,
    replyPendingEnd,
    isCapturingReplyRange,
    toggleReplies,
    clearReplyPendingTime,
    attachReplyCurrentTime,
    toggleReplyRangeCapture,
    submitReply,
  }
}
