import { useEffect, useRef, useState } from 'react'
import { deleteProject } from '../api/projects'
import { getMe } from '../api/users'
import ActionMenu from '../components/ActionMenu'
import { Avatar } from '../components/Avatar'
import ConfirmModal from '../components/ConfirmModal'
import Tabs from '../components/Tabs'
import VideoFeedbackTab, { VideoDetailView } from '../domains/workspace/VideoFeedbackTab'
import ProjectSettingsView from '../domains/workspace/ProjectSettingsView'
import DashboardNoticeCard from '../domains/workspace/DashboardNoticeCard'
import DashboardTodayScheduleCard from '../domains/workspace/DashboardTodayScheduleCard'
import DashboardActivityCard from '../domains/workspace/DashboardActivityCard'
import NoticeListView from '../domains/workspace/NoticeListView'
import NoticeDetailView from '../domains/workspace/NoticeDetailView'
import ProjectFileList from '../domains/workspace/ProjectFileList'
import { ProjectScheduleTab } from '../domains/workspace/ProjectScheduleTab'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useProjectStatusMenu } from '../hooks/useProjectStatusMenu'
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
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { project, setProject, members, activities, notices, setNotices, loading, error } =
    useProjectDetail(projectId)
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const statusMenu = useProjectStatusMenu(projectId, project, setProject, statusMenuRef)
  const [tab, setTab] = useState('dashboard')
  const [view, setView] = useState<'main' | 'settings'>('main')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)
  const [meId, setMeId] = useState<number | null>(null)
  /** 대시보드 탭 내부 공지사항 서브뷰 — 'main'=대시보드, 'list'=공지사항 목록, number=공지 상세(noticeId) */
  const [noticeView, setNoticeView] = useState<'main' | 'list' | number>('main')
  /** 활동 완료 토글 — API 연동 전 로컬 상태 */
  const [checkedActivityIds, setCheckedActivityIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    getMe()
      .then((me) => setMeId(me.id))
      .catch(() => setMeId(null))
  }, [])

  const handleTabChange = (key: string) => {
    setTab(key)
    if (key !== 'dashboard') setNoticeView('main')
  }

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

  const confirmDeleteProject = async () => {
    await deleteProject(projectId)
    navigate('/workspace')
  }

  if (view === 'settings') {
    return (
      <ProjectSettingsView
        project={project}
        onCancel={() => setView('main')}
        onSaved={(updated) => {
          setProject(updated)
          setView('main')
        }}
      />
    )
  }

  if (selectedVideoId !== null) {
    return (
      <VideoDetailView
        projectId={projectId}
        videoId={selectedVideoId}
        meId={meId}
        lengthType={project.lengthType}
        onBack={() => setSelectedVideoId(null)}
      />
    )
  }

  return (
    <section className="flex w-full flex-col gap-8">
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-head-md text-neutral-11 font-bold">{project.title}</h1>
            <ActionMenu
              items={[
                { action: 'edit', onClick: () => setView('settings') },
                { action: 'delete', onClick: () => setDeleteOpen(true) },
              ]}
              ariaLabel="프로젝트 메뉴"
            />
          </div>

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

          <div className="flex flex-col gap-2">
            <h2 className="text-head-sm text-neutral-11 font-bold">프로젝트 소개</h2>
            <p className="text-body-sm text-neutral-10 tracking-[-0.32px]">
              {project.description ?? '설명 없음'}
            </p>
          </div>
        </div>

        {members.length > 0 && (
          <div className="flex shrink-0 -space-x-2 pt-1">
            {members.slice(0, 4).map((member) => (
              <Avatar
                key={member.memberId}
                src={member.profileImageUrl ?? undefined}
                alt={member.nickname}
                size={33}
                fallback={member.nickname.slice(0, 1)}
                border="gray"
                className="bg-neutral-2"
              />
            ))}
          </div>
        )}
      </header>

      <div className="[&_[role=tab][aria-selected=true]]:border-primary w-full [&_[role=tab]]:flex-1 [&_[role=tab]]:px-0 [&_[role=tab]]:text-center [&_[role=tab]]:text-[20px] [&_[role=tab][aria-selected=true]]:border-b-[3px] [&_[role=tablist]]:w-full">
        <Tabs tabs={DETAIL_TABS} activeTab={tab} onChange={handleTabChange} />
      </div>

      {tab === 'dashboard' && noticeView === 'main' && (
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <DashboardNoticeCard notices={notices} onExpand={() => setNoticeView('list')} />
            <DashboardTodayScheduleCard projectId={projectId} />
          </div>

          <DashboardActivityCard
            activities={activities}
            checkedActivityIds={checkedActivityIds}
            onToggle={(activityId, checked) => {
              setCheckedActivityIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(activityId)
                else next.delete(activityId)
                return next
              })
            }}
          />
        </div>
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
          if (!selectedNotice) return null
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
        <VideoFeedbackTab projectId={projectId} onSelectVideo={setSelectedVideoId} />
      )}

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteProject}
        title="프로젝트를 삭제할까요?"
        description="삭제한 프로젝트는 복구할 수 없습니다."
      />
    </section>
  )
}
