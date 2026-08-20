import { Link } from 'react-router-dom'
import ActionMenu from '../../components/ActionMenu'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import { CARD_BASE } from '../../styles/card'
import VideoProgressStatusDropdown from './VideoProgressStatusDropdown'
import type { VideoProgressStatus } from '../../types/video'

interface VideoCardProps {
  title: string
  thumbnailUrl?: string | null
  status: VideoProgressStatus
  onStatusChange: (status: VideoProgressStatus) => void
  /** BE VideoItemResDTO.hasUnreadFeedback */
  hasUnreadFeedback?: boolean
  bookmarked?: boolean
  onToggleBookmark?: () => void
  /** React Router 경로 — 있으면 `<Link to>`로 이동 */
  to?: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export default function VideoCard({
  title,
  thumbnailUrl,
  status,
  onStatusChange,
  hasUnreadFeedback = false,
  bookmarked = false,
  onToggleBookmark,
  to,
  onClick,
  onEdit,
  onDelete,
  className = '',
}: VideoCardProps) {
  const menuItems = [
    ...(onEdit ? [{ action: 'edit' as const, onClick: onEdit }] : []),
    ...(onDelete ? [{ action: 'delete' as const, onClick: onDelete }] : []),
  ]
  const classNameMerged = `flex w-full flex-col gap-3 ${CARD_BASE} p-4 ${className}`

  const titleContent = (
    <span className="text-body-sm text-neutral-11 block truncate text-left font-semibold">
      {title}
    </span>
  )

  const thumbnailContent = (
    <div aria-hidden className="bg-neutral-3 aspect-video w-full overflow-hidden rounded-lg">
      {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />}
    </div>
  )

  return (
    <article className={classNameMerged}>
      <div className="flex items-start justify-between gap-2">
        {to ? (
          <Link to={to} className="hover:text-primary min-w-0 flex-1">
            {titleContent}
          </Link>
        ) : onClick ? (
          <button type="button" onClick={onClick} className="hover:text-primary min-w-0 flex-1">
            {titleContent}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{titleContent}</div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className={bookmarked ? 'text-caution' : 'text-neutral-6'}
            >
              <BookmarkStarIcon filled={bookmarked} className="size-5" />
            </button>
          )}
          {menuItems.length > 0 && <ActionMenu items={menuItems} ariaLabel="영상 메뉴" />}
        </div>
      </div>

      {to ? (
        <Link to={to} aria-label={`${title} 상세 보기`} className="block">
          {thumbnailContent}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`${title} 상세 보기`}
          className="block w-full"
        >
          {thumbnailContent}
        </button>
      ) : (
        thumbnailContent
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <VideoProgressStatusDropdown status={status} onChange={onStatusChange} />
        </div>
        {hasUnreadFeedback && (
          <span
            className="bg-warning size-2.75 shrink-0 rounded-full"
            aria-label="읽지 않은 피드백"
          />
        )}
      </div>
    </article>
  )
}
