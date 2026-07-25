import Tag from '../../components/Tag'
import ProgressBar from '../../components/ProgressBar'
import { Avatar } from '../../components/Avatar'
import { projectMetaTags } from '../../constants/projectLabels'
import type { Project, ProjectMember } from '../../types/project'

interface HomeProjectCardProps {
  project: Project
  members: ProjectMember[]
}

/** 진행률 API가 없어 프로젝트 상태로 근사한 값 */
const PROGRESS_BY_STATUS: Record<string, number> = {
  PREPARING: 15,
  IN_PROGRESS: 55,
  ON_HOLD: 35,
  DONE: 100,
}

const VISIBLE_AVATAR_COUNT = 3

export default function HomeProjectCard({ project, members }: HomeProjectCardProps) {
  const progress = PROGRESS_BY_STATUS[project.status] ?? PROGRESS_BY_STATUS.PREPARING
  const variant =
    project.status === 'DONE' ? 'success' : project.status === 'ON_HOLD' ? 'warning' : 'default'
  const tags = projectMetaTags(project)
  const visibleMembers = members.slice(0, VISIBLE_AVATAR_COUNT)
  const extraCount = members.length - visibleMembers.length

  return (
    <article className="flex h-[168px] flex-col items-start gap-2.5 rounded-[10.242px] bg-white p-4 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
      <h3 className="text-body-sm text-neutral-11 self-stretch font-semibold tracking-[-0.32px]">
        {project.title}
      </h3>

      <ProgressBar value={progress} variant={variant} />

      <div className="mt-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-3.5">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {members.length > 0 && (
          <div className="flex items-center -space-x-2">
            {visibleMembers.map((member) => (
              <Avatar
                key={member.id}
                src={member.profileImageUrl ?? undefined}
                alt={member.name}
                size={28}
                border="gray"
                fallback={
                  <span className="text-caption-sm text-neutral-7">{member.name.charAt(0)}</span>
                }
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
