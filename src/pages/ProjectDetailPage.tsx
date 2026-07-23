import { useRef, useState } from 'react'
import { deleteProject } from '../api/projects'
import ActionMenu from '../components/ActionMenu'
import { Avatar } from '../components/Avatar'
import ConfirmModal from '../components/ConfirmModal'
import Tabs from '../components/Tabs'
import VideoFeedbackTab from '../domains/workspace/VideoFeedbackTab'
import ProjectSettingsView from '../domains/workspace/ProjectSettingsView'
import DashboardNoticeCard from '../domains/workspace/DashboardNoticeCard'
import DashboardTodayScheduleCard from '../domains/workspace/DashboardTodayScheduleCard'
import DashboardActivityCard from '../domains/workspace/DashboardActivityCard'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useProjectStatusMenu } from '../hooks/useProjectStatusMenu'
import { projectMetaTags } from '../constants/projectLabels'
import { PROJECT_STATUS_LABEL, projectStatusColor, projectStatusLabel } from '../constants/projectStatus'
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
  const { project, setProject, members, activities, notices, loading, error } = useProjectDetail(projectId)
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const statusMenu = useProjectStatusMenu(projectId, project, setProject, statusMenuRef)
  const [tab, setTab] = useState('dashboard')
  const [view, setView] = useState<'main' | 'settings'>('main')
  const [deleteOpen, setDeleteOpen] = useState(false)
  /** 활동 완료 토글 — API 연동 전 로컬 상태 */
  const [checkedActivityIds, setCheckedActivityIds] = useState<Set<number>>(() => new Set())

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
                key={member.id}
                src={member.profileImageUrl ?? undefined}
                alt={member.name}
                size={33}
                fallback={member.name.slice(0, 1)}
                border="gray"
                className="bg-neutral-2"
              />
            ))}
          </div>
        )}
      </header>

      <div className="[&_[role=tab][aria-selected=true]]:border-primary w-full [&_[role=tab]]:flex-1 [&_[role=tab]]:px-0 [&_[role=tab]]:text-center [&_[role=tab]]:text-[20px] [&_[role=tab][aria-selected=true]]:border-b-[3px] [&_[role=tablist]]:w-full">
        <Tabs tabs={DETAIL_TABS} defaultTab="dashboard" onChange={setTab} />
      </div>

      {tab === 'dashboard' && (
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <DashboardNoticeCard notices={notices} />
            <DashboardTodayScheduleCard />
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

      {tab === 'schedule' && (
        <p className="text-caption-lg text-neutral-6">
          일정 화면은 캘린더 컴포넌트 리디자인 이후 별도로 구현합니다.
        </p>
      )}

      {tab === 'files' && (
        <p className="text-caption-lg text-neutral-6">
          파일 목록은 FileInput 컴포넌트 머지 이후 별도로 구현합니다.
        </p>
      )}

      {tab === 'feedback' && <VideoFeedbackTab projectId={projectId} />}

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
