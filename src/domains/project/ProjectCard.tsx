import type { KeyboardEvent } from 'react'
import { Avatar } from '../../components/Avatar'
import ProgressBar from '../../components/ProgressBar'
import Tag, { type TagVariant } from '../../components/Tag'

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
      className={`bg-neutral-3 flex w-full flex-col gap-3 rounded-xl p-6 shadow-[0_3px_12px_rgba(169,204,244,0.15)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-head-sm text-neutral-10 font-semibold">{title}</h3>
        <Tag variant={statusVariant}>{statusLabel}</Tag>
      </div>

      {typeof progress === 'number' && <ProgressBar value={progress} />}

      <div className="flex items-center justify-between gap-2">
        {tags.length > 0 && (
          <div className="flex gap-2">
            {tags.map((tag) => (
              <Tag key={tag} variant="primary">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div className="flex">
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
  )
}

export default ProjectCard
