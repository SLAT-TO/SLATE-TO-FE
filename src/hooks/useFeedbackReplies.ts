import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createReply, deleteReply, getReplies, updateReply } from '../api/videos'
import type { FeedbackReply } from '../types/feedback'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'

/** 피드백 답글 펼침/목록/작성
 * @param guestId 공유링크로 들어온 게스트가 작성하는 경우 (registerGuest로 발급받은 id) */
export function useFeedbackReplies(
  guestId?: number,
  projectId?: number,
  guestToken?: string,
  onReplyCountChange?: (feedbackId: number, delta: number) => void,
) {
  const queryClient = useQueryClient()
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null)
  const [repliesByFeedback, setRepliesByFeedback] = useState<Record<number, FeedbackReply[]>>({})
  const [replyCursorByFeedback, setReplyCursorByFeedback] = useState<
    Record<number, string | null>
  >({})
  const [hasMoreRepliesByFeedback, setHasMoreRepliesByFeedback] = useState<
    Record<number, boolean>
  >({})
  const [isLoadingMoreRepliesByFeedback, setIsLoadingMoreRepliesByFeedback] = useState<
    Record<number, boolean>
  >({})
  const [newReply, setNewReply] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editingReplyContent, setEditingReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [pendingReplyActionId, setPendingReplyActionId] = useState<number | null>(null)
  const isSubmittingReplyRef = useRef(false)
  const pendingReplyActionIdsRef = useRef(new Set<number>())
  const fetchingReplyIdsRef = useRef(new Set<number>())
  const loadingMoreReplyIdsRef = useRef(new Set<number>())

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
      if (repliesByFeedback[feedbackId] || fetchingReplyIdsRef.current.has(feedbackId)) return

      fetchingReplyIdsRef.current.add(feedbackId)
      try {
        const page = await getReplies(
          feedbackId,
          guestId != null ? { guestId, guestToken } : undefined,
        )
        setRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: page.items }))
        setReplyCursorByFeedback((prev) => ({ ...prev, [feedbackId]: page.nextCursor }))
        setHasMoreRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: page.hasNext }))
      } catch {
        window.alert('답글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        fetchingReplyIdsRef.current.delete(feedbackId)
      }
    },
    [expandedFeedbackId, guestId, guestToken, repliesByFeedback, resetReplyCompose],
  )

  /** "더 보기" — 피드백별로 저장해둔 nextCursor로 다음 페이지를 불러와 기존 답글 뒤에 이어붙인다 */
  const loadMoreReplies = useCallback(
    async (feedbackId: number) => {
      const cursor = replyCursorByFeedback[feedbackId]
      if (!hasMoreRepliesByFeedback[feedbackId] || cursor == null) return
      if (loadingMoreReplyIdsRef.current.has(feedbackId)) return

      loadingMoreReplyIdsRef.current.add(feedbackId)
      setIsLoadingMoreRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: true }))
      try {
        const page = await getReplies(feedbackId, {
          cursor,
          ...(guestId != null ? { guestId, guestToken } : {}),
        })
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: [...(prev[feedbackId] ?? []), ...page.items],
        }))
        setReplyCursorByFeedback((prev) => ({ ...prev, [feedbackId]: page.nextCursor }))
        setHasMoreRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: page.hasNext }))
      } catch {
        window.alert('답글을 더 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        loadingMoreReplyIdsRef.current.delete(feedbackId)
        setIsLoadingMoreRepliesByFeedback((prev) => ({ ...prev, [feedbackId]: false }))
      }
    },
    [replyCursorByFeedback, hasMoreRepliesByFeedback, guestId, guestToken],
  )

  const submitReply = useCallback(
    async (feedbackId: number) => {
      if (!newReply.trim() || isSubmittingReplyRef.current) return

      isSubmittingReplyRef.current = true
      setIsSubmittingReply(true)
      try {
        const created = await createReply(
          feedbackId,
          { content: newReply.trim() },
          guestId != null ? { guestId, guestToken } : undefined,
        )
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: [...(prev[feedbackId] ?? []), created],
        }))
        onReplyCountChange?.(feedbackId, 1)
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
    [newReply, guestId, guestToken, projectId, queryClient, resetReplyCompose, onReplyCountChange],
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
        const updated = await updateReply(
          replyId,
          { content },
          guestId != null ? { guestId, guestToken } : undefined,
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
        await deleteReply(replyId, guestId != null ? { guestId, guestToken } : undefined)
        setRepliesByFeedback((prev) => ({
          ...prev,
          [feedbackId]: (prev[feedbackId] ?? []).filter((reply) => reply.replyId !== replyId),
        }))
        onReplyCountChange?.(feedbackId, -1)
        if (editingReplyId === replyId) cancelEditReply()
      } catch {
        window.alert('답글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        pendingReplyActionIdsRef.current.delete(replyId)
        setPendingReplyActionId((current) => (current === replyId ? null : current))
      }
    },
    [cancelEditReply, editingReplyId, guestId, guestToken, onReplyCountChange],
  )

  return {
    expandedFeedbackId,
    repliesByFeedback,
    hasMoreRepliesByFeedback,
    isLoadingMoreRepliesByFeedback,
    newReply,
    setNewReply,
    editingReplyId,
    editingReplyContent,
    setEditingReplyContent,
    isSubmittingReply,
    pendingReplyActionId,
    toggleReplies,
    loadMoreReplies,
    submitReply,
    startEditReply,
    cancelEditReply,
    saveEditReply,
    removeReply,
  }
}
