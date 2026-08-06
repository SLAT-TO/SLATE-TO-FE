import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { updateProject } from '../api/projects'
import type { ProjectDetailResponse, ProjectStatus } from '../types/project'

export function useProjectStatusMenu(
  projectId: number,
  project: ProjectDetailResponse | null,
  setProject: Dispatch<SetStateAction<ProjectDetailResponse | null>>,
  containerRef: RefObject<HTMLDivElement | null>,
) {
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

  const changeStatus = async (status: ProjectStatus) => {
    setOpen(false)
    if (!project || status === project.status) return
    // BE ProjectUpdateRequest: title/type/lengthType/description/endDate 필수 (status만 PATCH 불가)
    if (!project.lengthType || !project.endDate || project.description == null) {
      window.alert('프로젝트 필수 정보가 없어 상태를 변경할 수 없습니다.')
      return
    }
    const previous = project.status
    setProject({ ...project, status })
    try {
      await updateProject(projectId, {
        title: project.title,
        type: project.type,
        lengthType: project.lengthType,
        description: project.description,
        endDate: project.endDate,
        clientName: project.clientName ?? undefined,
        kind: project.kind ?? undefined,
        status,
      })
    } catch {
      setProject((prev) => (prev ? { ...prev, status: previous } : prev))
    }
  }

  return { open, toggle, changeStatus }
}
