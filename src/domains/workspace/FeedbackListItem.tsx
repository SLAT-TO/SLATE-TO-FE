import { Avatar } from '../../components/Avatar'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import TextArea from '../../components/TextArea'
import type { FeedbackListEntry, FeedbackReply } from '../../types/feedback'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import commentCheckIcon from '../../assets/icons/comment-check.svg?raw'
import FeedbackReplies from './FeedbackReplies'
import { FeedbackTimeLink } from './videoDetailShared'

type FeedbackListItemProps = {
  feedback: FeedbackListEntry
  isMine: boolean
  isActionPending: boolean
  /** false면 해결 토글 숨김 (게스트 등 getMe 불가 컨텍스트) */
  canResolve?: boolean
  onSeek: (seconds: number) => void
  onEdit: () => void
  onRemove: () => void
  onToggleResolved: () => void
  isEditing: boolean
  editingContent: string
  onEditingContentChange: (value: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  isExpanded: boolean
  onToggleReplies: () => void
  /** undefined면 아직 이 피드백의 답글을 불러온 적 없다는 뜻 — 개수는 feedback.replyCount로 표시 */
  replies?: FeedbackReply[]
  newReply: string
  setNewReply: (value: string) => void
  onSubmitReply: () => void
  meId: number | null
  guestId?: number
  editingReplyId: number | null
  editingReplyContent: string
  isSubmittingReply: boolean
  pendingReplyActionId: number | null
  onEditingReplyContentChange: (value: string) => void
  onEditReply: (reply: FeedbackReply) => void
  onCancelEditReply: () => void
  onSaveEditReply: (replyId: number) => void
  onRemoveReply: (replyId: number) => void
}

export default function FeedbackListItem({
  feedback,
  isMine,
  isActionPending,
  canResolve = true,
  onSeek,
  onEdit,
  onRemove,
  onToggleResolved,
  isEditing,
  editingContent,
  onEditingContentChange,
  onCancelEdit,
  onSaveEdit,
  isExpanded,
  onToggleReplies,
  replies,
  newReply,
  setNewReply,
  onSubmitReply,
  meId,
  guestId,
  editingReplyId,
  editingReplyContent,
  isSubmittingReply,
  pendingReplyActionId,
  onEditingReplyContentChange,
  onEditReply,
  onCancelEditReply,
  onSaveEditReply,
  onRemoveReply,
}: FeedbackListItemProps) {
  const isResolved = feedback.status
  // 펼쳐서 실제로 불러온 뒤에는 그 개수가 최신값 — 그 전까지는 목록 조회 때 받은 replyCount로 표시
  const replyCount = replies ? replies.length : feedback.replyCount

  return (
    <li className="border-neutral-3 flex min-w-0 flex-col gap-3 border-b pb-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Avatar alt={feedback.actor.name} size={24} fallback={feedback.actor.name.slice(0, 1)} />
          <FeedbackTimeLink
            feedback={feedback}
            onSeek={onSeek}
            className="text-caption-lg text-primary font-bold underline"
          />
          <span className="text-caption-lg text-neutral-9 font-medium">{feedback.actor.name}</span>
          <span
            className={`size-2.5 shrink-0 rounded-full ${isResolved ? 'bg-success' : 'bg-warning'}`}
            aria-hidden
          />
        </div>
        {isMine && (
          <ActionMenu
            disabled={isActionPending}
            items={[
              { action: 'edit', onClick: onEdit },
              { action: 'delete', onClick: onRemove },
            ]}
          />
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <TextArea value={editingContent} onChange={onEditingContentChange} rows={2} />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
              className="w-20"
              disabled={isActionPending}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveEdit}
              className="w-20"
              disabled={isActionPending || !editingContent.trim()}
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-neutral-10 break-words">{feedback.content}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleReplies}
          className="text-caption-lg text-neutral-9 flex items-center gap-1 font-semibold"
        >
          답글
          {replyCount ? ` ${replyCount}` : ''}
          <InlineIcon
            svg={chevronDownIcon}
            className={`size-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {canResolve ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleResolved()
            }}
            aria-pressed={isResolved}
            disabled={isActionPending}
            aria-label={isResolved ? '미해결로 변경' : '해결 처리'}
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${
              isResolved ? 'text-success' : 'text-neutral-5'
            }`}
          >
            <InlineIcon svg={commentCheckIcon} className="pointer-events-none size-5" />
          </button>
        ) : (
          <span aria-hidden className="size-10 shrink-0" />
        )}
      </div>

      {isExpanded && (
        <FeedbackReplies
          replies={replies ?? []}
          newReply={newReply}
          setNewReply={setNewReply}
          onSubmitReply={onSubmitReply}
          meId={meId}
          guestId={guestId}
          editingReplyId={editingReplyId}
          editingReplyContent={editingReplyContent}
          isSubmittingReply={isSubmittingReply}
          pendingReplyActionId={pendingReplyActionId}
          onEditingContentChange={onEditingReplyContentChange}
          onEdit={onEditReply}
          onCancelEdit={onCancelEditReply}
          onSaveEdit={onSaveEditReply}
          onRemove={onRemoveReply}
        />
      )}
    </li>
  )
}
