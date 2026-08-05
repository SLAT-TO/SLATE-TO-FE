import Tag from '../../components/Tag'
import ProgressBar from '../../components/ProgressBar'
import { Avatar } from '../../components/Avatar'
import { projectMetaTags } from '../../constants/projectLabels'
import type { ProjectSummary } from '../../types/project'
import { navigate } from '../../utils/navigation'

interface HomeProjectCardProps {
  project: ProjectSummary
}

const VISIBLE_AVATAR_COUNT = 3

export default function HomeProjectCard({ project }: HomeProjectCardProps) {
  const variant = project.status === 'COMPLETED' ? 'success' : 'default'
  const tags = projectMetaTags(project)
  const visibleMembers = project.memberPreviewImageUrls.slice(0, VISIBLE_AVATAR_COUNT)
  const extraCount = project.memberCount - visibleMembers.length

  return (
    <article
      onClick={() => navigate(`/workspace/projects/${project.id}`)}
      className="flex h-34 cursor-pointer flex-col items-start gap-2 overflow-hidden rounded-[10.242px] bg-white p-4 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]"
    >
      <h3 className="text-body-sm text-neutral-11 self-stretch font-semibold tracking-[-0.32px]">
        {project.title}
      </h3>

      <ProgressBar
        value={project.deadlineProgressPercent ?? 0}
        variant={variant}
        className="mt-6 self-stretch"
      />

      <div className="mt-auto flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3.5 overflow-hidden">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {project.memberCount > 0 && (
          <div className="flex shrink-0 items-center -space-x-2">
            {visibleMembers.map((imageUrl, index) => (
              <Avatar
                key={index}
                src={imageUrl}
                size={28}
                border={index === visibleMembers.length - 1 ? 'black' : 'gray'}
              />
            ))}
            {extraCount > 0 && (
              <div
                className="border-border text-caption-sm text-neutral-6 flex items-center justify-center rounded-full border bg-white"
                style={{ width: 28, height: 28 }}
              >
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
