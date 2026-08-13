import { useEffect, useMemo, useRef, useState } from 'react'
import ActionMenu from '../../components/ActionMenu'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import { useHeaderSlot } from '../../hooks/useHeaderSlot'
import type { VideoDetail } from '../../types/video'
import type { MemberSummary } from '../../types/project'
import {
  PROJECT_STATUS_LABEL,
  projectStatusColor,
  projectStatusLabel,
} from '../../constants/projectStatus'
import type { ProjectStatus } from '../../types/project'
import MemberListPanel from './MemberListPanel'

type VideoDetailHeaderProps = {
  projectId: number
  videoDetail: VideoDetail | null
  toggleBookmark: () => void
  projectStatus: ProjectStatus
  onProjectStatusChange: (status: ProjectStatus) => void
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
  projectStatus,
  onProjectStatusChange,
  members,
  isAdmin,
  meId,
  onMembersChange,
  onEdit,
  onDelete,
}: VideoDetailHeaderProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const isCompleted = projectStatus === 'COMPLETED'

  useEffect(() => {
    if (!statusMenuOpen) return
    const closeMenu = (event: PointerEvent) => {
      if (!statusMenuRef.current?.contains(event.target as Node)) setStatusMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [statusMenuOpen])

  const headerLeftContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="text-head-sm text-neutral-11 truncate font-bold">{videoDetail.title}</h1>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={videoDetail.bookmarked ? '북마크 해제' : '북마크'}
            className={videoDetail.bookmarked ? 'text-caution' : 'text-neutral-4'}
          >
            <BookmarkStarIcon filled={videoDetail.bookmarked} className="size-4" />
          </button>
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              disabled={isCompleted}
              title={isCompleted ? '완료된 프로젝트는 진행 상황을 변경할 수 없습니다.' : undefined}
              className={`text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold disabled:cursor-not-allowed ${projectStatusColor(projectStatus)}`}
            >
              {projectStatusLabel(projectStatus)}
              <svg viewBox="0 0 12 12" fill="none" className="size-3">
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {statusMenuOpen && !isCompleted && (
              <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-24 rounded-lg border py-1 shadow-md">
                {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMenuOpen(false)
                        onProjectStatusChange(status)
                      }}
                      className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
                    >
                      {projectStatusLabel(status)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ml-auto sm:mr-4">
          <MemberListPanel
            projectId={projectId}
            members={members}
            isAdmin={isAdmin}
            meId={meId}
            avatarSize={40}
            onMembersChange={onMembersChange}
          />
        </div>
      </div>
    )
  }, [
    videoDetail,
    toggleBookmark,
    projectStatus,
    isCompleted,
    statusMenuOpen,
    onProjectStatusChange,
    members,
    projectId,
    isAdmin,
    meId,
    onMembersChange,
  ])

  const headerRightContent = useMemo(() => {
    if (!videoDetail) return null
    return (
      <ActionMenu
        items={[
          { action: 'edit', onClick: onEdit },
          { action: 'delete', onClick: onDelete },
        ]}
        ariaLabel="영상 메뉴"
      />
    )
  }, [videoDetail, onEdit, onDelete])

  useHeaderSlot(headerLeftContent, headerRightContent, { hideDefaultActions: true })

  return null
}
