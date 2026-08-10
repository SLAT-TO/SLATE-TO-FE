import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import InlineIcon from '../../components/InlineIcon'
import TextArea from '../../components/TextArea'
import type { FeedbackReply } from '../../types/feedback'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'
import { FeedbackTimeLink } from './videoDetailShared'

type FeedbackRepliesProps = {
  replies: FeedbackReply[]
  onSeek: (seconds: number) => void
  newReply: string
  setNewReply: (value: string) => void
  onSubmitReply: () => void
  meId: number | null
  guestId?: number
  editingReplyId: number | null
  editingReplyContent: string
  isSubmittingReply: boolean
  pendingReplyActionId: number | null
  onEditingContentChange: (value: string) => void
  onEdit: (reply: FeedbackReply) => void
  onCancelEdit: () => void
  onSaveEdit: (replyId: number) => void
  onRemove: (replyId: number) => void
}

export default function FeedbackReplies({
  replies,
  onSeek,
  newReply,
  setNewReply,
  onSubmitReply,
  meId,
  guestId,
  editingReplyId,
  editingReplyContent,
  isSubmittingReply,
  pendingReplyActionId,
  onEditingContentChange,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
}: FeedbackRepliesProps) {
  const [deleteTarget, setDeleteTarget] = useState<FeedbackReply | null>(null)

  return (
    <div className="flex min-w-0 flex-col gap-3 pl-1">
      {replies.map((reply) => {
        const isMine =
          (reply.actor.type === 'USER' && meId !== null && reply.actor.id === meId) ||
          (reply.actor.type === 'GUEST' && guestId != null && reply.actor.id === guestId)
        const isEditing = editingReplyId === reply.replyId
        const isReplyActionPending = pendingReplyActionId === reply.replyId

        return (
          <div key={reply.replyId} className="flex min-w-0 items-start gap-2">
            <Avatar alt={reply.actor.name} size={20} fallback={reply.actor.name.slice(0, 1)} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-caption-lg text-neutral-9 font-semibold">
                    {reply.actor.name}
                  </span>
                  <FeedbackTimeLink
                    feedback={reply}
                    onSeek={onSeek}
                    className="text-caption-lg text-primary font-bold underline"
                  />
                </div>
                {isMine && (
                  <ActionMenu
                    ariaLabel="답글 더보기"
                    disabled={isReplyActionPending}
                    items={[
                      { action: 'edit', onClick: () => onEdit(reply) },
                      { action: 'delete', onClick: () => setDeleteTarget(reply) },
                    ]}
                  />
                )}
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <TextArea
                    value={editingReplyContent}
                    onChange={onEditingContentChange}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onCancelEdit}
                      className="w-20"
                      disabled={isReplyActionPending}
                    >
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSaveEdit(reply.replyId)}
                      className="w-20"
                      disabled={isReplyActionPending}
                    >
                      {isReplyActionPending ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </div>
              ) : (
                <span className="text-body-sm text-neutral-10 break-words">{reply.content}</span>
              )}
            </div>
          </div>
        )
      })}
      <div className="flex min-w-0 items-center gap-2">
        <input
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          disabled={isSubmittingReply}
          placeholder="답글 남기기"
          className="border-neutral-3 focus:border-primary text-body-sm min-w-0 flex-1 rounded-lg border px-3 py-2.5 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              onSubmitReply()
            }
          }}
        />
        <button
          type="button"
          onClick={onSubmitReply}
          disabled={!newReply.trim() || isSubmittingReply}
          className="bg-primary disabled:bg-neutral-3 flex size-10 shrink-0 items-center justify-center rounded-full text-white"
          aria-label="답글 전송"
        >
          <InlineIcon svg={paperPlaneIcon} className="pointer-events-none size-5" />
        </button>
      </div>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onRemove(deleteTarget.replyId)
          setDeleteTarget(null)
        }}
        title="답글을 삭제할까요?"
        description="삭제한 답글은 복구할 수 없습니다."
      />
    </div>
  )
}
