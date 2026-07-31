import { useMemo } from 'react'
import type { RefObject } from 'react'
import ActionMenu from '../../components/ActionMenu'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import { useHeaderSlot } from '../../hooks/useHeaderSlot'
import type { VideoDetail } from '../../types/video'
import type { MemberSummary } from '../../types/project'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'

type VideoDetailHeaderProps = {
  videoDetail: VideoDetail | null
  toggleBookmark: () => void
  statusMenuOpen: boolean
  setStatusMenuOpen: (updater: (v: boolean) => boolean) => void
  statusMenuRef: RefObject<HTMLDivElement | null>
  changeVideoStatus: (status: 'IN_PROGRESS' | 'DONE') => void
  members: MemberSummary[]
  onEdit: () => void
  onDelete: () => void
  inviteMember: () => void
  inviteCopied: boolean
}

/** 전역 헤더 한 줄에 제목·북마크·상태·참여 인원(왼쪽, 대시보드와 동일 배치)과 초대 버튼·ActionMenu(오른쪽)를 채운다. */
export default function VideoDetailHeader({
  videoDetail,
  toggleBookmark,
  statusMenuOpen,
  setStatusMenuOpen,
  statusMenuRef,
  changeVideoStatus,
  members,
  onEdit,
  onDelete,
  inviteMember,
  inviteCopied,
}: VideoDetailHeaderProps) {
  const headerLeftContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-head-sm text-neutral-11 font-bold">{videoDetail.title}</h1>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={videoDetail.bookmarked ? '북마크 해제' : '북마크'}
            className={videoDetail.bookmarked ? 'text-caution' : 'text-neutral-4'}
          >
            <BookmarkStarIcon filled={videoDetail.bookmarked} className="size-4" />
          </button>
          {/* 영상 진행 상태 변경 API가 없어 로컬 상태만 갱신 (changeVideoStatus 주석 참고) */}
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className={`text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold ${videoDetail.progressStatus === 'DONE' ? 'bg-tag-done-bg text-tag-done-text' : 'bg-tag-active-bg text-tag-active-text'}`}
            >
              {videoDetail.progressStatus === 'DONE' ? '완료' : '진행중'}
              <InlineIcon svg={chevronDownIcon} className="size-3" />
            </button>
            {statusMenuOpen && (
              <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-24 rounded-lg border py-1 shadow-md">
                {(['IN_PROGRESS', 'DONE'] as const).map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      onClick={() => changeVideoStatus(status)}
                      className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
                    >
                      {status === 'DONE' ? '완료' : '진행중'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-caption-lg text-neutral-11 font-semibold">참여 인원</span>
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member) => (
                <Avatar
                  key={member.memberId}
                  src={member.profileImageUrl ?? undefined}
                  alt={member.nickname}
                  size={28}
                  fallback={member.nickname.slice(0, 1)}
                  border="gray"
                  className="bg-neutral-2"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }, [
    videoDetail,
    toggleBookmark,
    statusMenuOpen,
    setStatusMenuOpen,
    statusMenuRef,
    changeVideoStatus,
    members,
  ])

  const headerRightContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <div className="flex items-center gap-4">
        <ActionMenu
          items={[
            { action: 'edit', onClick: onEdit },
            { action: 'delete', onClick: onDelete },
          ]}
          ariaLabel="영상 메뉴"
        />
        <Button variant="primary" size="sm" onClick={inviteMember}>
          {inviteCopied ? '링크 복사됨' : '+ 초대'}
        </Button>
      </div>
    )
  }, [videoDetail, onEdit, onDelete, inviteMember, inviteCopied])

  useHeaderSlot(headerLeftContent, headerRightContent)

  return null
}
