import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Tag from '../../components/Tag'
import ProgressBar from '../../components/ProgressBar'
import { Avatar } from '../../components/Avatar'
import ActionMenu from '../../components/ActionMenu'
import BookmarkStarIcon from '../../components/icons/BookmarkStarIcon'
import type { ActionMenuItem } from '../../constants/actionMenu'
import { projectMetaTags } from '../../constants/projectLabels'
import { projectStatusLabel } from '../../constants/projectStatus'
import { roleLabel } from '../../constants/roles'
import type { ProjectSummary } from '../../types/project'
import { navigate } from '../../utils/navigation'

interface HomeProjectCardProps {
  project: ProjectSummary
  onTogglePin?: () => void
  menuItems?: ActionMenuItem[]
}

const VISIBLE_AVATAR_COUNT = 3

export default function HomeProjectCard({
  project,
  onTogglePin,
  menuItems = [],
}: HomeProjectCardProps) {
  const variant = project.status === 'COMPLETED' ? 'success' : 'default'
  const statusVariant = project.status === 'COMPLETED' ? 'ghost' : 'secondary'
  const tags = projectMetaTags({ type: project.type, lengthType: project.lengthType })
  const visibleMembers = project.memberPreviewImageUrls.slice(0, VISIBLE_AVATAR_COUNT)
  const extraCount = project.memberCount - visibleMembers.length
  const relativeTime = project.lastActivityAt
    ? formatDistanceToNow(new Date(project.lastActivityAt), { addSuffix: true, locale: ko })
    : undefined

  return (
    <a
      href={`/workspace/projects/${project.id}`}
      onClick={(e) => {
        e.preventDefault()
        navigate(`/workspace/projects/${project.id}`)
      }}
      className="focus-visible:ring-primary flex min-h-42 cursor-pointer flex-col items-start justify-between gap-2 rounded-[10.242px] bg-white p-4 shadow-[0px_3.414px_12.461px_rgba(169,204,244,0.15)] focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="text-caption-lg text-neutral-11 truncate font-semibold tracking-[-0.32px]">
                {project.title}
              </h3>
              {onTogglePin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onTogglePin()
                  }}
                  aria-pressed={project.isPinned}
                  aria-label={project.isPinned ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  className={`shrink-0 ${project.isPinned ? 'text-caution' : 'text-neutral-6'}`}
                >
                  <BookmarkStarIcon filled={project.isPinned} className="size-5" />
                </button>
              )}
            </div>
            <Tag variant={statusVariant} className="shrink-0">
              {projectStatusLabel(project.status)}
            </Tag>
          </div>

          {menuItems.length > 0 && (
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="shrink-0"
            >
              <ActionMenu items={menuItems} ariaLabel="프로젝트 메뉴" />
            </div>
          )}
        </div>

        {relativeTime && (
          <span className="text-caption-sm text-neutral-6">{relativeTime} 편집</span>
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-6">
        <ProgressBar
          value={project.deadlineProgressPercent ?? 0}
          variant={variant}
          className="self-stretch"
        />

        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {tags.map((tag) => (
              <Tag key={tag} variant="ghost" className="max-w-18 truncate">
                {tag}
              </Tag>
            ))}
            {project.roleNames.length > 0 && (
              <Tag variant="primary" className="max-w-18 truncate">
                {roleLabel(project.roleNames[0])}
              </Tag>
            )}
          </div>

          {project.memberCount > 0 && (
            <div className="flex shrink-0 items-center gap-1.5">
              {extraCount > 0 && (
                <span className="text-caption-sm text-neutral-6">+{extraCount}</span>
              )}
              <div className="flex items-center -space-x-2">
                {visibleMembers.map((imageUrl, index) => (
                  <Avatar
                    key={index}
                    src={imageUrl}
                    size={28}
                    border={index === visibleMembers.length - 1 ? 'black' : 'gray'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
