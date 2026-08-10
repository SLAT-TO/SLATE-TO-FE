import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
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
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false)
  const statusMenu = useProjectStatusMenu(projectId, project, setProject, statusMenuRef)
  const isCompleted = project.status === 'COMPLETED'

  const handleStatusSelect = (status: ProjectStatus) => {
    statusMenu.close()
    if (status === project.status) return
    if (status === 'COMPLETED') {
      setCompleteConfirmOpen(true)
      return
    }
    void statusMenu.changeStatus(status)
  }

  const confirmCompletion = () => {
    setCompleteConfirmOpen(false)
    void statusMenu.changeStatus('COMPLETED')
  }

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
          disabled={isCompleted}
          title={isCompleted ? '완료된 프로젝트는 진행 상황을 변경할 수 없습니다.' : undefined}
          className={`text-caption-sm flex items-center gap-1 rounded-[3px] px-[19px] py-1 font-semibold disabled:cursor-not-allowed ${projectStatusColor(project.status)}`}
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
        {statusMenu.open && !isCompleted && (
          <ul className="border-neutral-3 bg-bg-primary absolute top-full left-0 z-10 mt-1 w-32 rounded-lg border py-1 shadow-md">
            {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((status) => (
              <li key={status}>
                <button
                  type="button"
                  onClick={() => handleStatusSelect(status)}
                  className="hover:bg-neutral-2 text-caption-lg text-neutral-10 block w-full px-3 py-2 text-left"
                >
                  {PROJECT_STATUS_LABEL[status]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmModal
        isOpen={completeConfirmOpen}
        onClose={() => setCompleteConfirmOpen(false)}
        onConfirm={confirmCompletion}
        title="프로젝트를 완료로 전환할까요?"
        description="완료로 전환하면 참여자들의 포트폴리오에 자동으로 추가됩니다. 각자의 프로필 페이지에서 수정 및 삭제가 가능합니다. 완료로 변경하면 진행 상황을 수정할 수 없습니다."
        confirmText="진행하기"
        cancelText="취소"
      />
    </div>
  )
}
