import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMe } from '../api/users'
import {
  useDeleteProjectMutation,
  useLeaveProjectMutation,
  useToggleProjectPinMutation,
} from '../queries/projects'
import { projectKeys } from '../queries/keys'
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
import ProjectStatusMenu from '../domains/workspace/ProjectStatusMenu'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import type { ProjectActivity, ProjectListResponse } from '../types/project'

/** Strict Mode remount에서도 같은 키 alert가 두 번 뜨지 않도록 모듈 단위로 기록 */
const alertedPartialErrorKeys = new Set<string>()

const DETAIL_TABS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'schedule', label: '일정' },
  { key: 'files', label: '파일' },
  { key: 'feedback', label: '피드백' },
]

const DETAIL_TAB_KEYS = new Set(DETAIL_TABS.map((t) => t.key))

type DashboardPanel = 'notices' | 'activity'

type ProjectSearchNext = {
  tab?: string
  panel?: DashboardPanel | null
  noticeId?: number | null
  view?: 'settings' | null
}

type ProjectDetailPageProps = {
  projectId: number
  /** URL `/workspace/projects/:id/videos/:videoId` 에서 전달 — 있으면 영상 상세 */
  videoId?: number | null
}

function parseProjectSearch(search: string): {
  view: 'main' | 'settings'
  tab: string
  noticeView: 'main' | 'list' | number
  activityView: 'main' | 'list'
} {
  const params = new URLSearchParams(search)
  if (params.get('view') === 'settings') {
    return { view: 'settings', tab: 'dashboard', noticeView: 'main', activityView: 'main' }
  }

  const panel = params.get('panel')
  const noticeIdRaw = params.get('noticeId')
  const tabParam = params.get('tab')

  if (panel === 'notices') {
    const noticeId = noticeIdRaw != null ? Number(noticeIdRaw) : NaN
    return {
      view: 'main',
      tab: 'dashboard',
      noticeView: Number.isFinite(noticeId) ? noticeId : 'list',
      activityView: 'main',
    }
  }
  if (panel === 'activity') {
    return { view: 'main', tab: 'dashboard', noticeView: 'main', activityView: 'list' }
  }

  const tab =
    tabParam != null && DETAIL_TAB_KEYS.has(tabParam) && tabParam !== 'dashboard'
      ? tabParam
      : 'dashboard'
  return { view: 'main', tab, noticeView: 'main', activityView: 'main' }
}

function buildProjectSearch(next: ProjectSearchNext): string {
  const params = new URLSearchParams()
  if (next.view === 'settings') {
    params.set('view', 'settings')
  } else if (next.panel === 'notices') {
    params.set('panel', 'notices')
    if (next.noticeId != null) params.set('noticeId', String(next.noticeId))
  } else if (next.panel === 'activity') {
    params.set('panel', 'activity')
  } else if (next.tab != null && next.tab !== 'dashboard' && DETAIL_TAB_KEYS.has(next.tab)) {
    params.set('tab', next.tab)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export default function ProjectDetailPage({ projectId, videoId = null }: ProjectDetailPageProps) {
  const queryClient = useQueryClient()
  const routerNavigate = useNavigate()
  const location = useLocation()
  const { view, tab, noticeView, activityView } = parseProjectSearch(location.search)
  const {
    project,
    setProject,
    members,
    setMembers,
    activities,
    hasMoreActivities,
    loadMoreActivities,
    isLoadingMoreActivities,
    notices,
    setNotices,
    loading,
    error,
    partialErrors,
  } = useProjectDetail(projectId)
  const pinMutation = useToggleProjectPinMutation()
  const deleteMutation = useDeleteProjectMutation()
  const leaveMutation = useLeaveProjectMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [meId, setMeId] = useState<number | null>(null)
  /** 탭·공지/활동 패널·설정 — URL searchParams에서 파생 (뒤로가기·공유용) */

  const setProjectSearch = useCallback(
    (next: ProjectSearchNext, options?: { replace?: boolean }) => {
      const to = `/workspace/projects/${projectId}${buildProjectSearch(next)}`
      routerNavigate(to, { replace: options?.replace })
    },
    [projectId, routerNavigate],
  )
  const [initialFileId, setInitialFileId] = useState<number | null>(null)
  const [membersPanelOpen, setMembersPanelOpen] = useState(false)

  useEffect(() => {
    getMe()
      .then((me) => setMeId(me.id))
      .catch(() => setMeId(null))
  }, [])

  const partialErrorKey = partialErrors.join('|')
  useEffect(() => {
    if (!partialErrorKey) return
    const alertKey = `${projectId}:${partialErrorKey}`
    if (alertedPartialErrorKeys.has(alertKey)) return
    alertedPartialErrorKeys.add(alertKey)
    for (const message of partialErrorKey.split('|')) {
      if (message) window.alert(message)
    }
  }, [partialErrorKey, projectId])

  // 서브상태 리셋은 App의 <ProjectDetailPage key={projectId} /> 리마운트에 위임

  const closeVideo = useCallback(() => {
    routerNavigate(`/workspace/projects/${projectId}`, { replace: true })
  }, [projectId, routerNavigate])

  const handleTabChange = (key: string) => {
    setProjectSearch(key === 'dashboard' ? {} : { tab: key })
  }

  const handleActivityNavigate = (activity: ProjectActivity) => {
    if (activity.targetType === 'NOTICE' && activity.targetId != null) {
      setProjectSearch({ panel: 'notices', noticeId: activity.targetId })
      return
    }

    if (activity.targetType === 'FILE' && activity.targetId != null) {
      setInitialFileId(activity.targetId)
      setProjectSearch({ tab: 'files' })
      return
    }

    if (activity.targetType === 'VIDEO' && activity.targetId != null) {
      routerNavigate(`/workspace/projects/${projectId}/videos/${activity.targetId}`)
      return
    }

    if (
      activity.targetType === 'SCHEDULE' ||
      activity.type === 'SCHEDULE_CREATED' ||
      activity.type === 'SCHEDULE_UPDATED'
    ) {
      setProjectSearch({ tab: 'schedule' })
      return
    }

    if (activity.type === 'PROJECT_MEMBER_JOINED') {
      setMembersPanelOpen(true)
      setProjectSearch({})
      return
    }

    if (activity.type === 'PROJECT_UPDATED' || activity.type === 'PROJECT_STATUS_CHANGED') {
      setProjectSearch({ view: 'settings' })
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
            panelOpen={membersPanelOpen}
            onPanelOpenChange={setMembersPanelOpen}
          />
        </div>
      </div>
    )
  }, [
    showProjectHeader,
    project,
    members,
    handleToggleBookmark,
    projectId,
    meId,
    setMembers,
    membersPanelOpen,
  ])

  const openSettings = useCallback(() => {
    setProjectSearch({ view: 'settings' })
  }, [setProjectSearch])

  const headerRightContent = useMemo(() => {
    if (!showProjectHeader || !project) return null
    const items =
      project.myPermission === 'ADMIN'
        ? [
            { action: 'edit' as const, label: '설정', onClick: openSettings },
            { action: 'delete' as const, onClick: () => setDeleteOpen(true) },
          ]
        : [{ action: 'leave' as const, onClick: () => setLeaveOpen(true) }]
    return <ActionMenu items={items} ariaLabel="프로젝트 메뉴" />
  }, [showProjectHeader, project, openSettings])

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
          onClick={() => routerNavigate('/workspace')}
          className="text-body-sm text-primary w-fit underline"
        >
          워크스페이스로 돌아가기
        </button>
      </section>
    )
  }

  const confirmDeleteProject = () => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => routerNavigate('/workspace'),
    })
  }

  const confirmLeaveProject = () => {
    leaveMutation.mutate(projectId, {
      onSuccess: () => routerNavigate('/workspace'),
    })
  }

  if (view === 'settings') {
    // view=settings로 진입했을 수 있으므로, 나갈 때 URL을 정리해 새로고침 시 재진입되지 않게 한다.
    const leaveSettings = () => {
      setProjectSearch({}, { replace: true })
    }
    return (
      <ProjectSettingsView
        project={project}
        onCancel={leaveSettings}
        onSaved={(updated) => {
          setProject(updated)
          queryClient.setQueryData<InfiniteData<ProjectListResponse>>(projectKeys.list(), (prev) =>
            prev
              ? {
                  ...prev,
                  pages: prev.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                      item.id === updated.id
                        ? {
                            ...item,
                            title: updated.title,
                            endDate: updated.endDate,
                            clientName: updated.clientName,
                            type: updated.type,
                            lengthType: updated.lengthType,
                            status: updated.status,
                          }
                        : item,
                    ),
                  })),
                }
              : prev,
          )
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
        onBack={closeVideo}
      />
    )
  }

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <ProjectStatusMenu projectId={projectId} project={project} setProject={setProject} />

        <p className="text-body-sm text-neutral-10 tracking-[-0.32px]">
          {project.description ?? '설명 없음'}
        </p>
      </div>

      <div className="[&_[role=tab][aria-selected=true]]:border-primary w-full overflow-x-auto [&_[role=tab]]:shrink-0 [&_[role=tab]]:px-4 [&_[role=tab]]:text-center [&_[role=tab]]:text-base sm:[&_[role=tab]]:flex-1 sm:[&_[role=tab]]:px-0 sm:[&_[role=tab]]:text-[20px] [&_[role=tab][aria-selected=true]]:border-b-[3px] [&_[role=tablist]]:min-w-max sm:[&_[role=tablist]]:w-full sm:[&_[role=tablist]]:min-w-0">
        <Tabs tabs={DETAIL_TABS} activeTab={tab} onChange={handleTabChange} />
      </div>

      {tab === 'dashboard' && noticeView === 'main' && activityView === 'main' && (
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <DashboardNoticeCard
              notices={notices}
              onExpand={() => setProjectSearch({ panel: 'notices' })}
            />
            <DashboardTodayScheduleCard
              projectId={projectId}
              onExpand={() => handleTabChange('schedule')}
            />
          </div>

          <DashboardActivityCard
            activities={activities}
            onExpand={() => setProjectSearch({ panel: 'activity' })}
          />
        </div>
      )}

      {tab === 'dashboard' && activityView === 'list' && (
        <ActivityListView
          projectId={projectId}
          activities={activities}
          hasMore={hasMoreActivities}
          isLoadingMore={isLoadingMoreActivities}
          onLoadMore={() => void loadMoreActivities()}
          onBack={() => setProjectSearch({})}
          onNavigate={handleActivityNavigate}
        />
      )}

      {tab === 'schedule' && <ProjectScheduleTab projectId={projectId} members={members} />}

      {tab === 'dashboard' && noticeView === 'list' && (
        <NoticeListView
          projectId={projectId}
          notices={notices}
          onBack={() => setProjectSearch({})}
          onOpenNotice={(noticeId) => setProjectSearch({ panel: 'notices', noticeId })}
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
                  onClick={() => setProjectSearch({ panel: 'notices' })}
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
              onBack={() => setProjectSearch({ panel: 'notices' })}
              onUpdated={(updated) => {
                setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
              }}
              onDeleted={(noticeId) => {
                setNotices((prev) => prev.filter((n) => n.id !== noticeId))
                setProjectSearch({ panel: 'notices' })
              }}
            />
          )
        })()}

      {tab === 'files' && (
        <ProjectFileList
          projectId={projectId}
          initialFileId={initialFileId}
          onInitialFileConsumed={() => setInitialFileId(null)}
        />
      )}

      {tab === 'feedback' && <VideoFeedbackTab projectId={projectId} />}

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
