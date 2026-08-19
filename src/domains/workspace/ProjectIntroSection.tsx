import { ROLE_LABELS } from '../../constants/roles'

type ProjectIntroSectionProps = {
  /** BE가 유형·길이·형태(kind)·역할을 이미 합쳐서 내려준다 — 따로 조합하지 않는다 */
  projectTags: string[]
  memo: string | null
}

// 역할 '기타'(ETC)와 카테고리 '기타'(ETC)가 라벨이 똑같아 구분이 안 된다 — 지우면
// 카테고리가 기타인 프로젝트의 태그까지 같이 사라지므로 필터 대상에서 뺀다
const FILTERABLE_ROLE_LABELS = ROLE_LABELS.filter((label) => label !== '기타')

export default function ProjectIntroSection({ projectTags, memo }: ProjectIntroSectionProps) {
  // 영상 피드백은 프로젝트 멤버가 아닌 사람도 보므로, 역할 태그는 굳이 노출하지 않는다
  const displayTags = projectTags.filter((tag) => !FILTERABLE_ROLE_LABELS.includes(tag))

  return (
    <div className="flex flex-col gap-3">
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="bg-neutral-2 text-neutral-7 text-caption-sm rounded-[3px] px-[19px] py-1 font-semibold"
            >
              {tag}
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
