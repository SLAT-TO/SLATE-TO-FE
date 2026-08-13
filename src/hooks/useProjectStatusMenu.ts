import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateProject } from '../api/projects'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'
import type { ProjectDetailResponse, ProjectStatus } from '../types/project'

export function useProjectStatusMenu(
  projectId: number,
  project: ProjectDetailResponse | null,
  setProject: Dispatch<SetStateAction<ProjectDetailResponse | null>>,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, containerRef])

  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)

  const changeStatus = async (status: ProjectStatus) => {
    setOpen(false)
    if (!project || status === project.status) return
    // BE ProjectUpdateRequest: title/type/lengthType/description/endDate 필수 (status만 PATCH 불가)
    const { lengthType, description, endDate } = project
    const missing = [
      !lengthType ? '길이 유형' : null,
      description == null ? '설명' : null,
      !endDate ? '마감일' : null,
    ].filter(Boolean)
    if (!lengthType || description == null || !endDate) {
      window.alert(
        `프로젝트 필수 정보(${missing.join(', ')})가 없어 상태를 변경할 수 없습니다. 프로젝트 정보를 먼저 수정해 주세요.`,
      )
      return
    }
    const previous = project.status
    setProject({ ...project, status })
    try {
      await updateProject(projectId, {
        title: project.title,
        type: project.type,
        lengthType,
        description,
        endDate,
        clientName: project.clientName ?? undefined,
        kind: project.kind ?? undefined,
        status,
      })
      void invalidateProjectActivityData(queryClient, projectId)
    } catch {
      setProject((prev) => (prev ? { ...prev, status: previous } : prev))
    }
  }

  return { open, toggle, close, changeStatus }
}
