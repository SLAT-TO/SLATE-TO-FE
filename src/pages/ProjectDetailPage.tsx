import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getMe } from '../api/users'
import {
  useDeleteProjectMutation,
  useLeaveProjectMutation,
  useToggleProjectPinMutation,
} from '../queries/projects'
import ActionMenu from '../components/ActionMenu'
import ConfirmModal from '../components/ConfirmModal'
import BookmarkStarIcon from '../components/icons/BookmarkStarIcon'
import Tabs from '../components/Tabs'
import VideoFeedbackTab from '../domains/workspace/VideoFeedbackTab'
import { VideoDetailView } from '../domains/workspace/VideoDetailView'
import ProjectSettingsView from '../domains/workspace/ProjectSettingsView'
import DashboardNoticeCard from '../domains/workspace/DashboardNoticeCard'
import DashboardTodayScheduleCard from '../domains/workspace/DashboardTodayScheduleCard'
import DashboardActivityCard from '../domains/workspace/DashboardActivityCard'
import ActivityListView from '../domains/workspace/ActivityListView'
import MemberListPanel from '../domains/workspace/MemberListPanel'
import NoticeListView from '../domains/workspace/NoticeListView'
import NoticeDetailView from '../domains/workspace/NoticeDetailView'
import ProjectFileList from '../domains/workspace/ProjectFileList'
import { ProjectScheduleTab } from '../domains/workspace/ProjectScheduleTab'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useProjectStatusMenu } from '../hooks/useProjectStatusMenu'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { projectMetaTags } from '../constants/projectLabels'
import {
  PROJECT_STATUS_LABEL,
  projectStatusColor,
  projectStatusLabel,
} from '../constants/projectStatus'
import type { ProjectStatus } from '../types/project'
import { navigate } from '../utils/navigation'

const DETAIL_TABS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'schedule', label: '일정' },
  { key: 'files', label: '파일' },
  { key: 'feedback', label: '피드백' },
]

type ProjectDetailPageProps = {
  projectId: number
  /** URL `/workspace/projects/:id/videos/:videoId` 에서 전달 — 있으면 영상 상세 */
  videoId?: number | null
}

export default function ProjectDetailPage({
  projectId,
  videoId = null,
}: ProjectDetailPageProps) {
  const {
    project,
    setProject,
    members,
    setMembers,
    activities,
    notices,
    setNotices,
    loading,
    error,
    partialErrors,
  } = useProjectDetail(projectId)
  const pinMutation = useToggleProjectPinMutation()
  const deleteMutation = useDeleteProjectMutation()
  const leaveMutation = useLeaveProjectMutation()
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const statusMenu = useProjectStatusMenu(projectId, project, setProject, statusMenuRef)
  const [tab, setTab] = useState('dashboard')
  /** 목록의 "설정" 메뉴에서 `?view=settings`로 진입하는 경우를 초기값에 반영 (최초 마운트 1회) */
  const [view, setView] = useState<'main' | 'settings'>(() =>
    new URLSearchParams(window.location.search).get('view') === 'settings' ? 'settings' : 'main',
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [meId, setMeId] = useState<number | null>(null)
  /** 대시보드 탭 내부 공지사항 서브뷰 — 'main'=대시보드, 'list'=공지사항 목록, number=공지 상세(noticeId) */
  const [noticeView, setNoticeView] = useState<'main' | 'list' | number>('main')
  /** 대시보드 탭 내부 최근 활동 서브뷰 — 'main'=대시보드, 'list'=최근 활동 전체 목록 */
  const [activityView, setActivityView] = useState<'main' | 'list'>('main')

  useEffect(() => {
    getMe()
      .then((me) => setMeId(me.id))
      .catch(() => setMeId(null))
  }, [])

  // 서브상태 리셋은 App의 <ProjectDetailPage key={projectId} /> 리마운트에 위임

  const handleTabChange = (key: string) => {
    setTab(key)
    if (key !== 'dashboard') {
      setNoticeView('main')
      setActivityView('main')
    }
  }

  const handleToggleBookmark = useCallback(() => {
    if (!project) return
    pinMutation.mutate({ projectId, next: !project.isPinned })
  }, [project, projectId, pinMutation])

  /** 전역 헤더: 제목·즐겨찾기 + 참여인원(왼쪽 끝) → 알림·프로필·ActionMenu. 설정·영상 상세에서는 비움.
   * useMemo로 감싸지 않으면 매 렌더 새 JSX가 만들어져 useHeaderSlot의 effect가 무한 반복된다. */
  const showProjectHeader = Boolean(project) && view === 'main' && videoId == null

  const headerLeftContent = useMemo(() => {
    if (!showProjectHeader || !project) return null
    return (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-head-md text-neutral-11 font-bold">{project.title}</h1>
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-pressed={project.isPinned}
            aria-label={project.isPinned ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className={project.isPinned ? 'text-caution' : 'text-neutral-6'}
          >
            <BookmarkStarIcon filled={project.isPinned} />
          </button>
        </div>

        <div className="mr-4">
          <MemberListPanel
            projectId={projectId}
            members={members}
            isAdmin={project.myPermission === 'ADMIN'}
            meId={meId}
            avatarSize={40}
            onMembersChange={setMembers}
          />
        </div>
      </div>
    )
  }, [showProjectHeader, project, members, handleToggleBookmark, projectId, meId, setMembers])

  const headerRightContent = useMemo(() => {
    if (!showProjectHeader || !project) return null
    const items =
      project.myPermission === 'ADMIN'
        ? [
            { action: 'edit' as const, label: '설정', onClick: () => setView('settings') },
            { action: 'delete' as const, onClick: () => setDeleteOpen(true) },
          ]
        : [{ action: 'leave' as const, onClick: () => setLeaveOpen(true) }]
    return <ActionMenu items={items} ariaLabel="프로젝트 메뉴" />
  }, [showProjectHeader, project])

  useHeaderSlot(headerLeftContent, headerRightContent)

  if (loading) {
    return <p className="text-body-sm text-neutral-6">불러오는 중…</p>
  }

  if (error || !project) {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-body-sm text-warning">{error ?? '프로젝트를 찾을 수 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="text-body-sm text-primary w-fit underline"
        >
          워크스페이스로 돌아가기
        </button>
      </section>
    )
  }

  const metaTags = projectMetaTags(project)

  const confirmDeleteProject = () => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => navigate('/workspace'),
    })
  }

  const confirmLeaveProject = () => {
    leaveMutation.mutate(projectId, {
      onSuccess: () => navigate('/workspace'),
    })
  }

  if (view === 'settings') {
    // ?view=settings로 진입했을 수 있으므로, 나갈 때 URL을 정리해 새로고침 시 재진입되지 않게 한다.
    const leaveSettings = () => {
      navigate(`/workspace/projects/${projectId}`, { replace: true })
      setView('main')
    }
    return (
      <ProjectSettingsView
        project={project}
        onCancel={leaveSettings}
        onSaved={(updated) => {
          setProject(updated)
          leaveSettings()
        }}
      />
    )
  }

  if (videoId != null) {
    return (
      <VideoDetailView
        projectId={projectId}
        videoId={videoId}
        meId={meId}
        isAdmin={project.myPermission === 'ADMIN'}
        lengthType={project.lengthType}
        myRoleNames={project.roleNames}
        onBack={() => navigate(`/workspace/projects/${projectId}`, { replace: true })}
      />
    )
  }

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {metaTags.map((tag) => (
            <span
              key={tag}
              className="bg-main-1 text-main-6 text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
            >
              {tag}
            </span>
          ))}
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              onClick={statusMenu.toggle}
              className={`text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold ${projectStatusColor(project.status)}`}
            >
              {projectStatusLabel(project.status)}
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
            {statusMenu.open && (
              <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-32 rounded-lg border py-1 shadow-md">
                {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      onClick={() => statusMenu.changeStatus(status)}
                      className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
                    >
                      {PROJECT_STATUS_LABEL[status]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="text-body-sm text-neutral-10 tracking-[-0.32px]">
          {project.description ?? '설명 없음'}
        </p>
      </div>

      <div className="[&_[role=tab][aria-selected=true]]:border-primary w-full [&_[role=tab]]:flex-1 [&_[role=tab]]:px-0 [&_[role=tab]]:text-center [&_[role=tab]]:text-[20px] [&_[role=tab][aria-selected=true]]:border-b-[3px] [&_[role=tablist]]:w-full">
        <Tabs tabs={DETAIL_TABS} activeTab={tab} onChange={handleTabChange} />
      </div>

      {tab === 'dashboard' && noticeView === 'main' && activityView === 'main' && (
        <div className="flex flex-col gap-8">
          {partialErrors.length > 0 && (
            <ul className="text-body-sm text-warning flex flex-col gap-1">
              {partialErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          <div className="grid gap-8 lg:grid-cols-2">
            <DashboardNoticeCard notices={notices} onExpand={() => setNoticeView('list')} />
            <DashboardTodayScheduleCard
              projectId={projectId}
              onExpand={() => handleTabChange('schedule')}
            />
          </div>

          <DashboardActivityCard activities={activities} onExpand={() => setActivityView('list')} />
        </div>
      )}

      {tab === 'dashboard' && activityView === 'list' && (
        <ActivityListView activities={activities} onBack={() => setActivityView('main')} />
      )}

      {tab === 'schedule' && <ProjectScheduleTab projectId={projectId} members={members} />}

      {tab === 'dashboard' && noticeView === 'list' && (
        <NoticeListView
          projectId={projectId}
          notices={notices}
          onBack={() => setNoticeView('main')}
          onOpenNotice={(noticeId) => setNoticeView(noticeId)}
          onCreated={(notice) => setNotices((prev) => [notice, ...prev])}
        />
      )}

      {tab === 'dashboard' &&
        typeof noticeView === 'number' &&
        (() => {
          const selectedNotice = notices.find((n) => n.id === noticeView)
          if (!selectedNotice) {
            return (
              <section className="flex flex-col gap-3">
                <p className="text-body-sm text-warning">공지를 찾을 수 없습니다.</p>
                <button
                  type="button"
                  onClick={() => setNoticeView('list')}
                  className="text-body-sm text-primary w-fit underline"
                >
                  공지 목록으로 돌아가기
                </button>
              </section>
            )
          }
          return (
            <NoticeDetailView
              projectId={projectId}
              notice={selectedNotice}
              meId={meId}
              onBack={() => setNoticeView('list')}
              onUpdated={(updated) => {
                setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
              }}
              onDeleted={(noticeId) => {
                setNotices((prev) => prev.filter((n) => n.id !== noticeId))
                setNoticeView('list')
              }}
            />
          )
        })()}

      {tab === 'files' && <ProjectFileList projectId={projectId} />}

      {tab === 'feedback' && (
        <VideoFeedbackTab
          projectId={projectId}
          onSelectVideo={(id) => navigate(`/workspace/projects/${projectId}/videos/${id}`)}
        />
      )}

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteProject}
        title="정말 삭제하시겠습니까?"
        description="삭제된 워크스페이스 데이터는 되돌릴 수 없어요"
      />

      <ConfirmModal
        isOpen={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={confirmLeaveProject}
        title={`${project.title}에서 나가시겠습니까?`}
        confirmText="나가기"
      />
    </section>
  )
}
