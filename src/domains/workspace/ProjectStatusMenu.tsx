import { useRef, type Dispatch, type SetStateAction } from 'react'
import { projectMetaTags } from '../../constants/projectLabels'
import {
  PROJECT_STATUS_LABEL,
  projectStatusColor,
  projectStatusLabel,
} from '../../constants/projectStatus'
import { useProjectStatusMenu } from '../../hooks/useProjectStatusMenu'
import type { ProjectDetailResponse, ProjectStatus } from '../../types/project'

type ProjectStatusMenuProps = {
  projectId: number
  project: ProjectDetailResponse
  setProject: Dispatch<SetStateAction<ProjectDetailResponse | null>>
}

export default function ProjectStatusMenu({
  projectId,
  project,
  setProject,
}: ProjectStatusMenuProps) {
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const statusMenu = useProjectStatusMenu(projectId, project, setProject, statusMenuRef)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {projectMetaTags(project).map((tag) => (
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
  )
}
