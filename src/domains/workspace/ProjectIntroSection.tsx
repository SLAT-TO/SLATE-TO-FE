import {
  PROJECT_KIND_LABEL,
  PROJECT_LENGTH_TYPE_LABEL,
  PROJECT_TYPE_LABEL,
} from '../../constants/projectLabels'

type ProjectIntroSectionProps = {
  /** BE가 유형·길이·형태(kind)·역할을 이미 합쳐서 내려준다 — 따로 조합하지 않는다 */
  projectTags: string[]
  memo: string | null
}

// BE가 [유형, 길이, 형태(선택), ...역할들] 순으로 합쳐 내려주는데 형태(kind)가 없을 수 있어
// 위치로는 역할을 못 구분한다 — 대신 유형·길이·형태로 알려진 라벨만 "남기는" 화이트리스트 방식.
// "기타"처럼 유형과 역할 라벨이 같은 값이면 그냥 보여준다(숨기다 진짜 유형 태그를 지우는 것보다 안전).
const NON_ROLE_TAG_LABELS = new Set([
  ...Object.values(PROJECT_TYPE_LABEL),
  ...Object.values(PROJECT_LENGTH_TYPE_LABEL),
  ...Object.values(PROJECT_KIND_LABEL),
])

export default function ProjectIntroSection({ projectTags, memo }: ProjectIntroSectionProps) {
  // 영상 피드백은 프로젝트 멤버가 아닌 사람도 보므로, 역할 태그는 굳이 노출하지 않는다
  const displayTags = projectTags.filter((tag) => NON_ROLE_TAG_LABELS.has(tag))

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
