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
    const previous = project.status
    setProject({ ...project, status })
    try {
      await updateProject(projectId, { status })
    } catch {
      setProject((prev) => (prev ? { ...prev, status: previous } : prev))
    }
  }

  return { open, toggle, changeStatus }
}
