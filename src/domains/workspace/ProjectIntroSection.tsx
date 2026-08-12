import { PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'
import { roleLabel } from '../../constants/roles'
import type { ProjectLengthType } from '../../types/project'

type ProjectIntroSectionProps = {
  projectTags: string[]
  lengthType: ProjectLengthType | null
  myRoleNames: string[]
  memo: string | null
}

export default function ProjectIntroSection({
  projectTags,
  lengthType,
  myRoleNames,
  memo,
}: ProjectIntroSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {(projectTags.length > 0 || lengthType || myRoleNames.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {projectTags.map((tag) => (
            <span
              key={tag}
              className="bg-tag-done-bg text-tag-done-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
            >
              {tag}
            </span>
          ))}
          {lengthType && (
            <span className="bg-tag-done-bg text-tag-done-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold">
              {PROJECT_LENGTH_TYPE_LABEL[lengthType] ?? lengthType}
            </span>
          )}
          {myRoleNames.map((role) => (
            <span
              key={role}
              className="bg-tag-role-bg text-tag-role-text text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
            >
              {roleLabel(role)}
            </span>
          ))}
        </div>
      )}
      <div className="bg-neutral-2 border-neutral-3 text-body-sm text-neutral-5 rounded-lg border px-4 py-3">
        {memo || '영상에 관련된 메모가 없습니다.'}
      </div>
    </div>
  )
}
