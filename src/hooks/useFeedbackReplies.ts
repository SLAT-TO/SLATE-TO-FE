import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { resolveFeedbackActor } from '../domains/workspace/resolveFeedbackActor'
import { createReply, getReplies } from '../api/videos'
import type { FeedbackReply } from '../types/feedback'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'

/** 피드백 답글 펼침/목록/작성
 * @param guestId 공유링크로 들어온 게스트가 작성하는 경우 (registerGuest로 발급받은 id) */
export function useFeedbackReplies(guestId?: number, projectId?: number) {
  const queryClient = useQueryClient()
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [newReply, setNewReply] = useState('')

  const resetReplyCompose = useCallback(() => {
    setNewReply('')
  }, [])

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

  const submitReply = useCallback(
    async (feedbackId: number) => {
      if (!newReply.trim()) return
      const actor = resolveFeedbackActor(guestId)
      const created = await createReply(feedbackId, {
        content: newReply.trim(),
        ...actor,
      })
      setRepliesByFeedback((prev) => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] ?? []), created],
      }))
      resetReplyCompose()
      if (projectId != null) {
        void invalidateProjectActivityData(queryClient, projectId)
      }
    },
    [newReply, guestId, projectId, queryClient, resetReplyCompose],
  )

  return {
    expandedFeedbackId,
    repliesByFeedback,
    newReply,
    setNewReply,
    toggleReplies,
    submitReply,
  }
}
