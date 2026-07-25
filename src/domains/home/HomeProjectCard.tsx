import Tag from '../../components/Tag'
import ProgressBar from '../../components/ProgressBar'
import { Avatar } from '../../components/Avatar'
import { projectMetaTags } from '../../constants/projectLabels'
import { projectStatusColor, projectStatusLabel } from '../../constants/projectStatus'
import type { ProjectSummary } from '../../types/project'

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
    <article className="flex h-42 flex-col items-start gap-2.5 rounded-[10.242px] bg-white p-4 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
      <h3 className="text-body-sm text-neutral-11 self-stretch font-semibold tracking-[-0.32px]">
        {project.title}
      </h3>

      {project.deadlineProgressPercent != null ? (
        <ProgressBar value={project.deadlineProgressPercent} variant={variant} />
      ) : (
        <span
          className={`text-caption-sm w-fit rounded-[3px] px-4.75 py-1 font-semibold ${projectStatusColor(project.status)}`}
        >
          {projectStatusLabel(project.status)}
        </span>
      )}

      <div className="mt-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-3.5">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {project.memberCount > 0 && (
          <div className="flex items-center -space-x-2">
            {visibleMembers.map((imageUrl, index) => (
              <Avatar key={index} src={imageUrl} size={28} border="gray" />
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
