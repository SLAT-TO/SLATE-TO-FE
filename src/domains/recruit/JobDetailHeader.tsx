import { useState } from 'react'
import Tag from '../../components/Tag'
import ActionMenu from '../../components/ActionMenu'
import type { ActionMenuItem } from '../../constants/actionMenu'
import type { RecruitmentDetail } from '../../types/Recruit.types'

interface JobDetailHeaderProps {
  detail: RecruitmentDetail
  isOwner: boolean
}

function JobDetailHeader({ detail, isOwner }: JobDetailHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  // TODO: 공고 수정 페이지 연결 (별도 이슈), 삭제 확인 모달 연결
  const menuItems: ActionMenuItem[] = [
    { action: 'edit', onClick: () => {} },
    { action: 'delete', onClick: () => {} },
  ]

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-head-sm text-neutral-11 font-bold">{detail.title}</h2>

          {isOwner ? (
            <>
              <span className="text-caption-sm text-neutral-6">{detail.createdAt}</span>
              <span className="text-caption-sm text-neutral-6">조회 {detail.viewCount}</span>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsBookmarked((prev) => !prev)}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
              className={isBookmarked ? 'text-primary' : 'text-neutral-11'}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
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
            <Tag variant="secondary">{detail.status}</Tag>
            <Tag variant="secondary">{detail.dDay}</Tag>
          </>
        ) : (
          <>
            <Tag>{detail.type}</Tag>
            <Tag>{detail.category}</Tag>
            <span className="text-caption-lg text-neutral-11 font-bold">{detail.dDay}</span>
          </>
        )}
      </div>
    </header>
  )
}

export default JobDetailHeader
