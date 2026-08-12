import Tag from '../../components/Tag'
import ActionMenu from '../../components/ActionMenu'
import type { ActionMenuItem } from '../../constants/actionMenu'
import type { RecruitmentDetailResponse } from '../../types/recruitment'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'
import { navigate } from '../../utils/navigation'

interface JobDetailHeaderProps {
  detail: RecruitmentDetailResponse
  onBookmarkClick: () => void
  onDeleteClick: () => void
}

function JobDetailHeader({ detail, onBookmarkClick, onDeleteClick }: JobDetailHeaderProps) {
  const isOwner = detail.isMine
  const isClosed = detail.status === 'CLOSED'

  const menuItems: ActionMenuItem[] = [
    { action: 'edit', onClick: () => navigate(`/matching/${detail.id}/edit`) },
    { action: 'delete', onClick: onDeleteClick },
  ]

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-head-md text-neutral-11 font-bold">{detail.title}</h2>

          {isOwner ? (
            <>
              <span className="text-caption-sm text-neutral-6">
                {detail.createdAt.slice(0, 10)}
              </span>
              <span className="text-caption-sm text-neutral-6">조회 {detail.viewCount}</span>
            </>
          ) : (
            <button
              type="button"
              onClick={onBookmarkClick}
              aria-pressed={detail.isBookmarked}
              aria-label={detail.isBookmarked ? '북마크 해제' : '북마크 추가'}
              className={detail.isBookmarked ? 'text-primary' : 'text-neutral-11'}
            >
              <svg
                viewBox="0 0 24 24"
                fill={detail.isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className="h-7 w-7"
              >
                <path d="M6 2C4.89543 2 4 2.89543 4 4V22L12 17L20 22V4C20 2.89543 19.1046 2 18 2H6Z" />
              </svg>
            </button>
          )}
        </div>

        {isOwner && <ActionMenu items={menuItems} ariaLabel="공고 옵션 더보기" />}
      </div>

      <div className="flex items-center gap-3">
        {isOwner ? (
          <>
            <Tag variant="secondary">{isClosed ? '모집 완료' : '모집 중'}</Tag>
            <Tag variant="secondary">{isClosed ? '마감' : `D-${detail.dday}`}</Tag>
          </>
        ) : (
          <>
            <Tag variant="meta">{PROJECT_TYPE_LABEL[detail.category] ?? detail.category}</Tag>
            <Tag variant="meta">
              {detail.lengthType
                ? (PROJECT_LENGTH_TYPE_LABEL[detail.lengthType] ?? detail.lengthType)
                : '-'}
            </Tag>
            <span className="text-caption-lg text-neutral-11 font-bold">
              {isClosed ? '마감' : `D-${detail.dday}`}
            </span>
          </>
        )}
      </div>
    </header>
  )
}

export default JobDetailHeader
