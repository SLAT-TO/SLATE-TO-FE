import type { KeyboardEvent, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import ActionMenu from '../../components/ActionMenu'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import Tag from '../../components/Tag'
import { CARD_BASE } from '../../styles/card'

export type VideoCardProgressStatus = 'IN_PROGRESS' | 'DONE' | string

interface VideoCardProps {
  title: string
  thumbnailUrl?: string | null
  progressStatus: VideoCardProgressStatus
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
  progressStatus,
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
  const isClickable = Boolean(to || onClick)

  const handleActivate = () => {
    onClick?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isClickable || to) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  const stopCardClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const stopCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  const classNameMerged = `flex w-full flex-col gap-3 ${CARD_BASE} p-4 ${isClickable ? 'hover:bg-neutral-1 cursor-pointer' : ''} ${className}`

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-body-sm text-neutral-11 min-w-0 flex-1 truncate text-left font-semibold">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {onToggleBookmark && (
            <div onClick={stopCardClick} onKeyDown={stopCardKeyDown}>
              <button
                type="button"
                onClick={onToggleBookmark}
                aria-pressed={bookmarked}
                aria-label={bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                className={bookmarked ? 'text-caution' : 'text-neutral-6'}
              >
                <BookmarkStarIcon filled={bookmarked} className="size-5" />
              </button>
            </div>
          )}
          {menuItems.length > 0 && (
            <div onClick={stopCardClick} onKeyDown={stopCardKeyDown}>
              <ActionMenu items={menuItems} ariaLabel="영상 메뉴" />
            </div>
          )}
        </div>
      </div>

      <div aria-hidden className="bg-neutral-3 aspect-video w-full overflow-hidden rounded-lg">
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Tag variant={progressStatus === 'DONE' ? 'ghost' : 'secondary'}>
            {progressStatus === 'DONE' ? '완료' : '진행중'}
          </Tag>
        </div>
        {hasUnreadFeedback && (
          <span
            className="bg-warning size-2.75 shrink-0 rounded-full"
            aria-label="읽지 않은 피드백"
          />
        )}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classNameMerged}>
        {body}
      </Link>
    )
  }

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleActivate : undefined}
      onKeyDown={handleKeyDown}
      className={classNameMerged}
    >
      {body}
    </div>
  )
}
