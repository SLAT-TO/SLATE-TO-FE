import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import Modal from '../../components/Modal'
import { Button } from '../../components/Button'
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
  const projectTags = projectMetaTags(project)
  const projectMetaTagCount = projectMetaTags({
    type: project.type,
    lengthType: project.lengthType,
  }).length

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
      {projectTags.map((tag, index) => (
        <span
          key={tag}
          className={`text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold ${
            index < projectMetaTagCount
              ? 'bg-tag-done-bg text-tag-done-text'
              : 'bg-main-1 text-main-6'
          }`}
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
      <Modal
        isOpen={completeConfirmOpen}
        onClose={() => setCompleteConfirmOpen(false)}
        className="w-[calc(100vw-32px)] max-w-[780px]"
      >
        <div className="flex flex-col items-center px-6 py-6 text-center sm:px-16 sm:py-8">
          <h2 className="text-head-lg text-neutral-11 max-w-[560px] font-bold">
            완료로 전환하면 참여자들의 포트폴리오에 자동으로 추가됩니다.
          </h2>
          <div className="text-body-sm text-neutral-6 mt-5 flex flex-col gap-1">
            <p>각자의 프로필 페이지에서 수정 삭제가 가능합니다.</p>
            <p>완료로 변경 시 진행 상황 변경이 불가합니다.</p>
          </div>
          <div className="mt-12 flex w-full max-w-[550px] gap-6">
            <Button variant="primary" size="md" className="flex-1" onClick={confirmCompletion}>
              확인
            </Button>
            <Button
              variant="negative"
              size="md"
              className="flex-1"
              onClick={() => setCompleteConfirmOpen(false)}
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
