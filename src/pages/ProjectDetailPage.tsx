import { useEffect, useState } from 'react'
import {
  getProject,
  getProjectActivities,
  getProjectFiles,
  getProjectMembers,
  getProjectNotices,
} from '../api/projects'
import { Avatar } from '../components/Avatar'
import Choice from '../components/Choice'
import Tabs from '../components/Tabs'
import { projectMetaTags } from '../constants/projectLabels'
import type { Project, ProjectActivity, ProjectMember } from '../types/project'
import type { ProjectFileListItem } from '../types/file'
import type { ProjectNoticeListItem } from '../types/notice'
import { ApiError } from '../types/api'
import { navigate } from '../utils/navigation'
import bellIcon from '../assets/icons/bell.svg?raw'

const DETAIL_TABS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'schedule', label: '일정' },
  { key: 'files', label: '파일' },
  { key: 'feedback', label: '피드백' },
]

const CARD_SHADOW = 'shadow-[0px_3.4px_12.5px_rgba(169,204,244,0.15)]'

type ProjectDetailPageProps = {
  projectId: number
}

/** assets/icons SVG(raw) — fill=currentColor라 부모 text 색으로 칠해짐 */
function AssetIcon({ svg, className }: { svg: string; className: string }) {
  return (
    <span
      aria-hidden
      className={`text-main-7 inline-flex shrink-0 [&_svg]:block [&_svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function formatNoticeMeta(notice: ProjectNoticeListItem): string {
  const date = new Date(notice.createdAt)
  if (Number.isNaN(date.getTime())) return notice.writer.nickname
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${notice.writer.nickname} ${month}월 ${day}일 ${hours}:${minutes}`
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [notices, setNotices] = useState<ProjectNoticeListItem[]>([])
  const [files, setFiles] = useState<ProjectFileListItem[]>([])
  const [tab, setTab] = useState('dashboard')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  /** 활동 완료 토글 — API 연동 전 로컬 상태 */
  const [checkedActivityIds, setCheckedActivityIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [projectResult, activityPage, noticePage, filePage, memberList] = await Promise.all([
          getProject(projectId),
          getProjectActivities(projectId),
          getProjectNotices(projectId),
          getProjectFiles(projectId),
          getProjectMembers(projectId).catch(() => [] as ProjectMember[]),
        ])
        if (cancelled) return
        setProject(projectResult)
        setActivities(activityPage.items)
        setNotices(noticePage.items)
        setFiles(filePage.items)
        setMembers(memberList)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '프로젝트 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

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

  return (
    <section className="flex w-full flex-col gap-8">
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <h1 className="text-head-md text-neutral-11 font-bold">{project.title}</h1>

          {metaTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metaTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-main-1 text-main-6 text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

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
            <section className="flex flex-col gap-5">
              <h2 className="text-head-sm text-neutral-11 font-bold">공지 사항</h2>
              <div
                className={`flex min-h-[183px] flex-col justify-center rounded-[10px] bg-white p-4 ${CARD_SHADOW}`}
              >
                {notices.length === 0 ? (
                  <p className="text-caption-lg text-neutral-6">등록된 공지가 없습니다.</p>
                ) : (
                  <ul className="flex flex-col gap-8">
                    {notices.map((notice) => (
                      <li key={notice.id} className="flex items-center gap-5">
                        <AssetIcon svg={bellIcon} className="size-[17px]" />
                        <div className="flex min-w-0 flex-col gap-2">
                          <span className="text-body-sm text-neutral-11 truncate">
                            {notice.title}
                          </span>
                          <span className="text-caption-lg text-neutral-6">
                            {formatNoticeMeta(notice)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="text-head-sm text-neutral-11 font-bold">오늘 일정</h2>
              <div
                className={`flex min-h-[183px] flex-col justify-center rounded-[10px] bg-white p-4 ${CARD_SHADOW}`}
              >
                <p className="text-caption-lg text-neutral-6">
                  일정 API 연결 전입니다. 이후 오늘 일정을 표시합니다.
                </p>
              </div>
            </section>
          </div>

          <section className="flex flex-col gap-5">
            <h2 className="text-head-sm text-neutral-11 font-bold">최근 활동</h2>
            <div
              className={`flex min-h-[183px] flex-col rounded-[10px] bg-white p-4 ${CARD_SHADOW} ${activities.length === 0 ? 'justify-center' : 'justify-start'}`}
            >
              {activities.length === 0 ? (
                <p className="text-caption-lg text-neutral-6">최근 활동이 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {activities.map((activity) => (
                    <li key={activity.id}>
                      <Choice
                        type="checkbox"
                        className="relative"
                        checked={checkedActivityIds.has(activity.id)}
                        onChange={(checked) => {
                          setCheckedActivityIds((prev) => {
                            const next = new Set(prev)
                            if (checked) next.add(activity.id)
                            else next.delete(activity.id)
                            return next
                          })
                        }}
                        label={activity.content}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'schedule' && (
        <p className="text-body-sm text-neutral-6">
          일정 탭 골격입니다. 이후 캘린더 API와 연결합니다.
        </p>
      )}

      {tab === 'files' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-body-sm text-neutral-11 font-semibold">파일</h2>
          {files.length === 0 ? (
            <p className="text-caption-lg text-neutral-6">파일이 없습니다.</p>
          ) : (
            <ul className="border-border divide-border divide-y border-y">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="text-body-sm text-neutral-11 flex items-center justify-between gap-3 py-3"
                >
                  <span>{file.fileName}</span>
                  <span className="text-caption-lg text-neutral-6">{file.uploader.nickname}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'feedback' && (
        <p className="text-body-sm text-neutral-6">
          피드백 탭 골격입니다. 영상 목록·피드백 화면은 이후 조립합니다.
        </p>
      )}
    </section>
  )
}
