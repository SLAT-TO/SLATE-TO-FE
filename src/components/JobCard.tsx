// src/components/JobCard.tsx
import Tag from './Tag'

interface JobCardProps {
  category: string
  length?: string
  title: string
  description?: string
  role: string
  dDay: string
  isBookmarked: boolean
  onClick?: () => void
  onBookmarkClick: () => void
  /** @deprecated 하위호환용 — 렌더링 안 함. 홈 등 기존 사용처 호환 */
  type?: string
  /** @deprecated 하위호환용 — 렌더링 안 함 */
  price?: string
}

function JobCard({
  length,
  category,
  title,
  description,
  role,
  dDay,
  isBookmarked,
  onClick,
  onBookmarkClick,
}: JobCardProps) {
  return (
    <article
      onClick={onClick}
      className={`bg-bg-primary flex h-full w-full flex-col gap-6 rounded-xl p-4 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-gradation)_15%,transparent)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3.5">
            <Tag variant="meta">{category}</Tag>
            {length && <Tag variant="meta">{length}</Tag>}
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

      <div className="mt-auto flex items-center justify-between gap-3">
        <Tag variant="primary">{role}</Tag>
        <span className="text-body-sm text-neutral-11 shrink-0 font-semibold">{dDay}</span>
      </div>
    </article>
  )
}

export default JobCard
