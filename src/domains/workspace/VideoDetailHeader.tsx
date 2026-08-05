import { useMemo, useState } from 'react'
import type { RefObject } from 'react'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import InlineIcon from '../../components/InlineIcon'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import { useHeaderSlot } from '../../hooks/useHeaderSlot'
import type { VideoDetail } from '../../types/video'
import type { MemberSummary } from '../../types/project'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import MemberListPanel from './MemberListPanel'

type VideoDetailHeaderProps = {
  projectId: number
  videoDetail: VideoDetail | null
  toggleBookmark: () => void
  statusMenuOpen: boolean
  setStatusMenuOpen: (updater: (v: boolean) => boolean) => void
  statusMenuRef: RefObject<HTMLDivElement | null>
  changeVideoStatus: (status: 'IN_PROGRESS' | 'DONE') => void
  members: MemberSummary[]
  isAdmin: boolean
  meId: number | null
  onMembersChange: (members: MemberSummary[]) => void
  onEdit: () => void
  onDelete: () => void
}

/** 전역 헤더: 제목·북마크·상태 + 참여인원(왼쪽 끝) → 알림·프로필·ActionMenu·초대. */
export default function VideoDetailHeader({
  projectId,
  videoDetail,
  toggleBookmark,
  statusMenuOpen,
  setStatusMenuOpen,
  statusMenuRef,
  changeVideoStatus,
  members,
  isAdmin,
  meId,
  onMembersChange,
  onEdit,
  onDelete,
}: VideoDetailHeaderProps) {
  const [inviteOpen, setInviteOpen] = useState(false)

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

        <div className="mr-4">
          <MemberListPanel
            projectId={projectId}
            members={members}
            isAdmin={isAdmin}
            meId={meId}
            avatarSize={40}
            onMembersChange={onMembersChange}
            inviteOpen={inviteOpen}
            onInviteOpenChange={setInviteOpen}
          />
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
    projectId,
    isAdmin,
    meId,
    onMembersChange,
    inviteOpen,
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
        <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
          게스트 초대하기
        </Button>
      </div>
    )
  }, [videoDetail, onEdit, onDelete])

  useHeaderSlot(headerLeftContent, headerRightContent)

  return null
}
