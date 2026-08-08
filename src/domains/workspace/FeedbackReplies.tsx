import { Avatar } from '../../components/Avatar'
import InlineIcon from '../../components/InlineIcon'
import type { FeedbackReply } from '../../types/feedback'
import paperPlaneIcon from '../../assets/icons/paper-plane.svg?raw'
import { FeedbackTimeLink } from './videoDetailShared'

type FeedbackRepliesProps = {
  replies: FeedbackReply[]
  onSeek: (seconds: number) => void
  newReply: string
  setNewReply: (value: string) => void
  onSubmitReply: () => void
}

export default function FeedbackReplies({
  replies,
  onSeek,
  newReply,
  setNewReply,
  onSubmitReply,
}: FeedbackRepliesProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 pl-1">
      {replies.map((reply) => (
        <div key={reply.replyId} className="flex min-w-0 items-start gap-2">
          <Avatar alt={reply.actor.name} size={20} fallback={reply.actor.name.slice(0, 1)} />
          <div className="flex min-w-0 flex-col gap-0.5">
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
            <span className="text-body-sm text-neutral-10 break-words">{reply.content}</span>
          </div>
        </div>
      ))}
      <div className="flex min-w-0 items-center gap-2">
        <input
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
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
          disabled={!newReply.trim()}
          className="bg-primary disabled:bg-neutral-3 flex size-10 shrink-0 items-center justify-center rounded-full text-white"
          aria-label="답글 전송"
        >
          <InlineIcon svg={paperPlaneIcon} className="pointer-events-none size-5" />
        </button>
      </div>
    </div>
  )
}
