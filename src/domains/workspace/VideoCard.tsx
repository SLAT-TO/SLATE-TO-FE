import ActionMenu from '../../components/ActionMenu'
import Tag from '../../components/Tag'
import { CARD_BASE } from '../../styles/card'

export type VideoCardProgressStatus = 'IN_PROGRESS' | 'DONE' | string

interface VideoCardProps {
  title: string
  thumbnailUrl?: string | null
  progressStatus: VideoCardProgressStatus
  /** 상태 태그 옆에 보여줄 상대 시간 문구 (예: "2시간 전") — 계산은 호출부에서 */
  relativeTime?: string
  unreadCommentCount?: number
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export default function VideoCard({
  title,
  thumbnailUrl,
  progressStatus,
  relativeTime,
  unreadCommentCount = 0,
  onClick,
  onEdit,
  onDelete,
  className = '',
}: VideoCardProps) {
  const menuItems = [
    ...(onEdit ? [{ action: 'edit' as const, onClick: onEdit }] : []),
    ...(onDelete ? [{ action: 'delete' as const, onClick: onDelete }] : []),
  ]

  return (
    <div className={`flex w-full flex-col gap-3 ${CARD_BASE} p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick}
          className="text-body-sm text-neutral-11 min-w-0 flex-1 truncate text-left font-semibold"
        >
          {title}
        </button>
        {menuItems.length > 0 && <ActionMenu items={menuItems} ariaLabel="영상 메뉴" />}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={title}
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
