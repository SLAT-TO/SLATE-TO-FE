import { useEffect, useState } from 'react'
import {
  getProject,
  getProjectActivities,
  getProjectMembers,
  getProjectNotices,
} from '../api/projects'
import { ApiError } from '../types/api'
import type { Project, ProjectActivity, ProjectMember } from '../types/project'
import type { ProjectNoticeListItem } from '../types/notice'

export function useProjectDetail(projectId: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
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
        const [projectResult, activityPage, noticePage, memberList] = await Promise.all([
          getProject(projectId),
          getProjectActivities(projectId),
          getProjectNotices(projectId),
          getProjectMembers(projectId).catch(() => [] as ProjectMember[]),
        ])
        if (cancelled) return
        setProject(projectResult)
        setActivities(activityPage.items)
        setNotices(noticePage.items)
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

  return { project, setProject, members, activities, notices, loading, error }
}
