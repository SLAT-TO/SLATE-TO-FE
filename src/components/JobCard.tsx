// src/components/JobCard.tsx
import { memo } from 'react'
import Tag, { type TagVariant } from './Tag'

interface JobCardProps {
  id: number
  category: string
  length?: string
  title: string
  description?: string
  role: string
  dDay: string
  isBookmarked: boolean
  /** 지원한 공고에서만 노출하는 지원 상태 */
  statusLabel?: string
  statusVariant?: TagVariant
  /** 부모가 useCallback으로 안정화한 핸들러를 넘겨받아 id로 대상 카드를 식별한다 —
   * 카드마다 인라인 클로저를 새로 만들지 않아야 React.memo가 실제로 효과가 있다 */
  onClick?: (id: number) => void
  onBookmarkClick: (id: number) => void
  /** @deprecated 하위호환용 — 렌더링 안 함. 홈 등 기존 사용처 호환 */
  type?: string
  /** @deprecated 하위호환용 — 렌더링 안 함 */
  price?: string
}

function JobCard({
  id,
  length,
  category,
  title,
  description,
  role,
  dDay,
  isBookmarked,
  statusLabel,
  statusVariant = 'secondary',
  onClick,
  onBookmarkClick,
}: JobCardProps) {
  return (
    <article
      onClick={onClick ? () => onClick(id) : undefined}
      className={`bg-bg-primary flex h-full w-full flex-col gap-6 rounded-xl p-4 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-gradation)_15%,transparent)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3.5">
            {statusLabel && <Tag variant={statusVariant}>{statusLabel}</Tag>}
            <Tag variant="meta">{category}</Tag>
            {length && <Tag variant="meta">{length}</Tag>}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation() // 카드 클릭(상세 이동) 막기
              onBookmarkClick(id)
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

export default memo(JobCard)
