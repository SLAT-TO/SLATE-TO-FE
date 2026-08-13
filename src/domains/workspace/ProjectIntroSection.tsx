type ProjectIntroSectionProps = {
  /** BE가 유형·길이·형태(kind)·역할을 이미 합쳐서 내려준다 — 따로 조합하지 않는다 */
  projectTags: string[]
  memo: string | null
}

export default function ProjectIntroSection({ projectTags, memo }: ProjectIntroSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {projectTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {projectTags.map((tag) => (
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
