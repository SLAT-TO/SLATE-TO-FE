import ActionMenu from '../../components/ActionMenu'
import Tag from '../../components/Tag'

export type VideoCardProgressStatus = 'IN_PROGRESS' | 'DONE' | string

interface VideoCardProps {
  title: string
  thumbnailUrl?: string | null
  progressStatus: VideoCardProgressStatus
  /** 상태 태그 옆에 보여줄 상대 시간 문구 (예: "2시간 전") — 계산은 호출부에서 */
  relativeTime?: string
  unreadCommentCount?: number
  onClick?: () => void
  onDelete?: () => void
  className?: string
}

const CARD_SHADOW = 'shadow-[0px_3.414px_12.461px_rgba(169,204,244,0.15)]'

export default function VideoCard({
  title,
  thumbnailUrl,
  progressStatus,
  relativeTime,
  unreadCommentCount = 0,
  onClick,
  onDelete,
  className = '',
}: VideoCardProps) {
  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-[10px] bg-white p-4 ${CARD_SHADOW} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick}
          className="text-body-sm text-neutral-11 min-w-0 flex-1 truncate text-left font-semibold"
        >
          {title}
        </button>
        {onDelete && (
          <ActionMenu items={[{ action: 'delete', onClick: onDelete }]} ariaLabel="영상 메뉴" />
        )}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className="bg-neutral-3 aspect-video w-full overflow-hidden rounded-lg"
      >
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />}
      </button>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Tag variant={progressStatus === 'DONE' ? 'ghost' : 'secondary'}>
            {progressStatus === 'DONE' ? '완료' : '진행중'}
          </Tag>
          {relativeTime && <span className="text-caption-sm text-neutral-6">{relativeTime}</span>}
        </div>
        {unreadCommentCount > 0 && (
          <span className="bg-warning flex size-5 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white">
            {unreadCommentCount}
          </span>
        )}
      </div>
    </div>
  )
}
