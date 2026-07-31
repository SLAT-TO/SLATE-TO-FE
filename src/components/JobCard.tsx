// src/components/JobCard.tsx
import Tag from './Tag'

interface JobCardProps {
  type: string
  category: string
  title: string
  description?: string
  role: string
  price?: string
  dDay: string
  isBookmarked: boolean
  onClick?: () => void
  onBookmarkClick: () => void
}

function JobCard({
  type,
  category,
  title,
  description,
  role,
  price,
  dDay,
  isBookmarked,
  onClick,
  onBookmarkClick,
}: JobCardProps) {
  return (
    <article
      onClick={onClick}
      className={`bg-bg-primary flex w-full flex-col gap-6 rounded-xl p-4 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-gradation)_15%,transparent)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3.5">
            <Tag>{type}</Tag>
            <Tag>{category}</Tag>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation() // 카드 클릭(상세 이동) 막기
              onBookmarkClick()
            }}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
            className={`shrink-0 ${isBookmarked ? 'text-primary' : 'text-neutral-11'}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2C4.89543 2 4 2.89543 4 4V22L12 17L20 22V4C20 2.89543 19.1046 2 18 2H6Z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-body-sm text-neutral-11 font-semibold">{title}</h3>
          {description && <p className="text-caption-lg text-neutral-11">{description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tag variant="primary">{role}</Tag>

        <div className="flex shrink-0 items-center gap-4">
          {price && <span className="text-caption-sm text-neutral-11 font-semibold">{price}</span>}
          <span className="text-body-sm text-neutral-11 font-semibold">{dDay}</span>
        </div>
      </div>
    </article>
  )
}

export default JobCard
