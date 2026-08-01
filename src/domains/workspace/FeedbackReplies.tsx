import { Avatar } from '../../components/Avatar'
import InlineIcon from '../../components/InlineIcon'
import type { FeedbackReply } from '../../types/feedback'
import clockIcon from '../../assets/icons/clock.svg?raw'
import xIcon from '../../assets/icons/x.svg?raw'
import { formatPendingTime } from './videoDetailFormat'
import { FeedbackTimeLink } from './videoDetailShared'

type FeedbackRepliesProps = {
  replies: FeedbackReply[]
  onSeek: (seconds: number) => void
  newReply: string
  setNewReply: (value: string) => void
  replyPendingStart: number | null
  replyPendingEnd: number | null
  isCapturingReplyRange: boolean
  clearReplyPendingTime: () => void
  attachReplyCurrentTime: () => void
  toggleReplyRangeCapture: () => void
  onSubmitReply: () => void
}

export default function FeedbackReplies({
  replies,
  onSeek,
  newReply,
  setNewReply,
  replyPendingStart,
  replyPendingEnd,
  isCapturingReplyRange,
  clearReplyPendingTime,
  attachReplyCurrentTime,
  toggleReplyRangeCapture,
  onSubmitReply,
}: FeedbackRepliesProps) {
  return (
    <div className="flex flex-col gap-2 pl-2">
      {replies.map((reply) => (
        <div key={reply.replyId} className="flex items-start gap-2">
          <Avatar alt={reply.actor.name} size={18} fallback={reply.actor.name.slice(0, 1)} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-caption-sm text-neutral-9 font-semibold">
                {reply.actor.name}
              </span>
              <FeedbackTimeLink
                feedback={reply}
                onSeek={onSeek}
                className="text-caption-sm text-primary font-bold underline"
              />
            </div>
            <span className="text-caption-lg text-neutral-10">{reply.content}</span>
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={attachReplyCurrentTime}
            aria-label="현재 위치 기록"
            className={`border-neutral-5 flex size-9 items-center justify-center rounded-lg border ${
              replyPendingStart !== null && replyPendingEnd === null && !isCapturingReplyRange
                ? 'border-primary text-primary'
                : 'text-neutral-9'
            }`}
          >
            <InlineIcon svg={clockIcon} className="pointer-events-none size-4" />
          </button>
          <button
            type="button"
            onClick={toggleReplyRangeCapture}
            aria-label="구간 기록"
            title={isCapturingReplyRange ? '종료 지점 기록' : '구간 기록'}
            className={`border-neutral-5 flex h-9 items-center rounded-lg border px-2.5 ${
              isCapturingReplyRange || replyPendingEnd !== null
                ? 'border-primary text-primary'
                : 'text-neutral-9'
            }`}
          >
            <InlineIcon svg={clockIcon} className="pointer-events-none size-4" />
            <span aria-hidden className="mx-0.5 h-0.5 w-2 bg-current" />
            <InlineIcon svg={clockIcon} className="pointer-events-none size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-neutral-3 focus-within:border-primary flex flex-1 items-center gap-2 rounded-md border px-2 py-1">
            {formatPendingTime(replyPendingStart, replyPendingEnd) && (
              <span className="text-caption-sm text-primary flex shrink-0 items-center gap-0.5 font-bold">
                {formatPendingTime(replyPendingStart, replyPendingEnd)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    clearReplyPendingTime()
                  }}
                  aria-label="시간 첨부 취소"
                  className="text-neutral-5 hover:text-neutral-7 inline-flex size-7 items-center justify-center rounded"
                >
                  <InlineIcon svg={xIcon} className="pointer-events-none size-3" />
                </button>
              </span>
            )}
            <input
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="답글 남기기"
              className="text-caption-lg min-w-0 flex-1 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onSubmitReply}
            disabled={!newReply.trim()}
            className="text-primary disabled:text-neutral-4 text-caption-sm inline-flex h-9 items-center px-2 font-semibold"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}
