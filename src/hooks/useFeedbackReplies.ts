import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { resolveFeedbackActor } from '../domains/workspace/resolveFeedbackActor'
import { createReply, deleteReply, getReplies, updateReply } from '../api/videos'
import type { FeedbackReply } from '../types/feedback'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'

/** 피드백 답글 펼침/목록/작성
 * @param guestId 공유링크로 들어온 게스트가 작성하는 경우 (registerGuest로 발급받은 id) */
export function useFeedbackReplies(guestId?: number, projectId?: number, guestToken?: string) {
  const queryClient = useQueryClient()
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [newReply, setNewReply] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editingReplyContent, setEditingReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [pendingReplyActionId, setPendingReplyActionId] = useState<number | null>(null)
  const isSubmittingReplyRef = useRef(false)
  const pendingReplyActionIdsRef = useRef(new Set<number>())

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
        void getReplies(feedbackId, guestId != null ? { guestId, guestToken } : undefined).then(
          (page) => {
            setRepliesByFeedback((p) => ({ ...p, [feedbackId]: page.items }))
          },
          () => {
            window.alert('답글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
          },
        )
        return prev
      })
    },
    [expandedFeedbackId, guestId, guestToken, resetReplyCompose],
  )

  const submitReply = useCallback(
    async (feedbackId: number) => {
      if (!newReply.trim() || isSubmittingReplyRef.current) return

      isSubmittingReplyRef.current = true
      setIsSubmittingReply(true)
      try {
        const actor = resolveFeedbackActor(guestId)
        const created = await createReply(
          feedbackId,
          {
            content: newReply.trim(),
            ...actor,
          },
          guestId != null ? { guestId, guestToken } : undefined,
        )
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: [...(prev[feedbackId] ?? []), created],
        }))
        resetReplyCompose()
        if (projectId != null) {
          void invalidateProjectActivityData(queryClient, projectId)
        }
      } catch {
        window.alert('답글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        isSubmittingReplyRef.current = false
        setIsSubmittingReply(false)
      }
    },
    [newReply, guestId, guestToken, projectId, queryClient, resetReplyCompose],
  )

  const startEditReply = useCallback((reply: FeedbackReply) => {
    setEditingReplyId(reply.replyId)
    setEditingReplyContent(reply.content)
  }, [])

  const cancelEditReply = useCallback(() => {
    setEditingReplyId(null)
    setEditingReplyContent('')
  }, [])

  const saveEditReply = useCallback(
    async (feedbackId: number, replyId: number) => {
      const content = editingReplyContent.trim()
      if (!content || pendingReplyActionIdsRef.current.has(replyId)) return

      pendingReplyActionIdsRef.current.add(replyId)
      setPendingReplyActionId(replyId)
      try {
        const actor = resolveFeedbackActor(guestId)
        const updated = await updateReply(
          replyId,
          { content, ...actor },
          actor.guestId != null ? { ...actor, guestToken } : undefined,
        )
        if (!updated) throw new Error('답글 수정 응답이 없습니다.')
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: (prev[feedbackId] ?? []).map((reply) =>
            reply.replyId === replyId ? updated : reply,
          ),
        }))
        cancelEditReply()
      } catch {
        window.alert('답글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        pendingReplyActionIdsRef.current.delete(replyId)
        setPendingReplyActionId((current) => (current === replyId ? null : current))
      }
    },
    [cancelEditReply, editingReplyContent, guestId, guestToken],
  )

  const removeReply = useCallback(
    async (feedbackId: number, replyId: number) => {
      if (pendingReplyActionIdsRef.current.has(replyId)) return

      pendingReplyActionIdsRef.current.add(replyId)
      setPendingReplyActionId(replyId)
      try {
        const actor = resolveFeedbackActor(guestId)
        await deleteReply(replyId, actor.guestId != null ? { ...actor, guestToken } : undefined)
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: (prev[feedbackId] ?? []).filter((reply) => reply.replyId !== replyId),
        }))
        if (editingReplyId === replyId) cancelEditReply()
      } catch {
        window.alert('답글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        pendingReplyActionIdsRef.current.delete(replyId)
        setPendingReplyActionId((current) => (current === replyId ? null : current))
      }
    },
    [cancelEditReply, editingReplyId, guestId, guestToken],
  )

  return {
    expandedFeedbackId,
    repliesByFeedback,
    newReply,
    setNewReply,
    editingReplyId,
    editingReplyContent,
    setEditingReplyContent,
    isSubmittingReply,
    pendingReplyActionId,
    toggleReplies,
    submitReply,
    startEditReply,
    cancelEditReply,
    saveEditReply,
    removeReply,
  }
}
