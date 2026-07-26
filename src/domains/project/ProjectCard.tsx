import type { KeyboardEvent } from 'react'
import { Avatar } from '../../components/Avatar'
import ActionMenu from '../../components/ActionMenu'
import type { ActionMenuItem } from '../../constants/actionMenu'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import ProgressBar from '../../components/ProgressBar'
import Tag, { type TagVariant } from '../../components/Tag'
import { CARD_BASE } from '../../styles/card'

interface ProjectCardMember {
  src?: string
  alt?: string
}

interface ProjectCardProps {
  title: string
  statusLabel: string
  /** 상태 문구에 맞는 Tag 색상 (예: 진행중=secondary, 완료=ghost) — 호출부에서 도메인 상태값 기준으로 결정 */
  statusVariant?: TagVariant
  /** 장르·분량 등 메타 태그 */
  tags?: string[]
  /** 0~100, 미전달 시 진행률 바 숨김 */
  progress?: number
  members?: ProjectCardMember[]
  isPinned?: boolean
  onTogglePin?: () => void
  /** "n분 전" 등 상대 시간 — 계산은 호출부에서 (VideoCard와 동일 패턴) */
  relativeTime?: string
  /** ActionMenu(⋮) 항목 — 미전달 시 메뉴 자체를 숨김 */
  menuItems?: ActionMenuItem[]
  onClick?: () => void
  className?: string
}

const AVATAR_SIZE = 28

const ProjectCard = ({
  title,
  statusLabel,
  statusVariant = 'secondary',
  tags = [],
  progress,
  members = [],
  isPinned = false,
  onTogglePin,
  relativeTime,
  menuItems = [],
  onClick,
  className = '',
}: ProjectCardProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`${CARD_BASE} flex w-full flex-col gap-6 p-6 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* 제목·즐겨찾기·상태 태그 ... ⋮ 메뉴 — 카드 전체 너비 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-head-sm text-neutral-10 truncate font-semibold">{title}</h3>
            {onTogglePin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation() // 카드 클릭(상세 이동) 막기
                  onTogglePin()
                }}
                aria-pressed={isPinned}
                aria-label={isPinned ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                className={`shrink-0 ${isPinned ? 'text-caution' : 'text-neutral-6'}`}
              >
                <BookmarkStarIcon filled={isPinned} className="size-5" />
              </button>
            )}
          </div>
          <Tag variant={statusVariant} className="shrink-0">
            {statusLabel}
          </Tag>
        </div>

        {menuItems.length > 0 && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <ActionMenu items={menuItems} ariaLabel="프로젝트 메뉴" />
          </div>
        )}
      </div>

      {/* 영상 썸네일(좌) · 태그/진행률/멤버(우) — 가로 분할 */}
      <div className="flex gap-10">
        <div className="bg-neutral-2 flex aspect-23/8 w-2/5 shrink-0 items-center justify-center rounded-lg">
          <p className="text-caption-lg text-neutral-6 px-4 text-center">
            아직 등록된 영상이 없어요
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} variant="primary">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
            {relativeTime && (
              <span className="text-caption-sm text-neutral-6 shrink-0">{relativeTime} 활동</span>
            )}
          </div>

          {typeof progress === 'number' && (
            <div className="flex flex-col gap-1">
              <span className="text-caption-sm text-neutral-6">진행률 {progress}%</span>
              <ProgressBar value={progress} />
            </div>
          )}

          {members.length > 0 && (
            <div className="flex justify-end">
              {members.map((member, index) => (
                <Avatar
                  key={`${member.alt ?? 'member'}-${index}`}
                  src={member.src}
                  alt={member.alt}
                  size={AVATAR_SIZE}
                  className={`ring-neutral-3 ring-2 ${index === 0 ? '' : '-ml-2'}`}
                  fallback={<span className="bg-neutral-4 size-full" />}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
