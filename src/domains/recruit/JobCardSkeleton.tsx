/** 구인구직 공고 목록 로딩 — JobCard 구조에 맞춘 스켈레톤 */

function Bone({ className = '' }: { className?: string }) {
  return <div className={`bg-neutral-2 animate-pulse rounded-lg ${className}`} />
}

export default function JobCardSkeleton() {
  return (
    <div className="bg-bg-primary flex h-full w-full flex-col gap-6 rounded-xl p-4 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-gradation)_15%,transparent)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3.5">
            <Bone className="h-6 w-14 rounded-[3px]" />
            <Bone className="h-6 w-16 rounded-[3px]" />
          </div>
          <Bone className="size-4 shrink-0" />
        </div>
        <Bone className="h-5 w-4/5" />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <Bone className="h-6 w-20 rounded-[3px]" />
        <Bone className="h-5 w-10 shrink-0" />
      </div>
    </div>
  )
}
