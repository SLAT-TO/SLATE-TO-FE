import { useEffect, useState } from 'react'
import {
  getProject,
  getProjectActivities,
  getProjectMembers,
  getProjectNotices,
} from '../api/projects'
import { ApiError } from '../types/api'
import type {
  MemberSummary,
  ProjectActivity,
  ProjectDetailResponse,
} from '../types/project'
import type { ProjectNoticeListItem } from '../types/notice'

export function useProjectDetail(projectId: number) {
  const [project, setProject] = useState<ProjectDetailResponse | null>(null)
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [notices, setNotices] = useState<ProjectNoticeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const emptyActivities = { items: [] as ProjectActivity[], nextCursor: null, hasNext: false }
        const [projectResult, activityPage, noticePage, memberList] = await Promise.all([
          getProject(projectId),
          getProjectActivities(projectId).catch(() => emptyActivities),
          getProjectNotices(projectId),
          getProjectMembers(projectId).catch(() => ({ items: [] as MemberSummary[], memberCount: 0 })),
        ])
        if (cancelled) return
        setProject(projectResult)
        setActivities(activityPage.items)
        setNotices(noticePage.items)
        setMembers(memberList.items)
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

  return { project, setProject, members, activities, notices, setNotices, loading, error }
}
