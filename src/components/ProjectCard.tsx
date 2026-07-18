import type { KeyboardEvent } from 'react'
import { Avatar } from './Avatar'
import ProgressBar from './ProgressBar'
import Tag from './Tag'

interface ProjectCardMember {
  src?: string
  alt?: string
}

interface ProjectCardProps {
  title: string
  /** 상태 문구 (예: 편집 중) — 색 배지 없이 일반 텍스트로 표시 (Figma 기준) */
  status?: string
  /** 장르·역할 등 메타 태그 (Tag variant=primary로 통일 표시) */
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
  status,
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
        {status && <span className="text-body-sm text-neutral-8">{status}</span>}
      </div>

      {typeof progress === 'number' && <ProgressBar value={progress} />}

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Tag key={tag} variant="primary">
              {tag}
            </Tag>
          ))}
        </div>

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
