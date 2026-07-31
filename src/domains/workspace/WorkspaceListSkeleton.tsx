import { CARD_BASE } from '../../styles/card'

/** 워크스페이스 프로젝트 목록 로딩 — ProjectCard(세로 풀와이드) 구조에 맞춘 스켈레톤 */

function Bone({ className = '' }: { className?: string }) {
  return <div className={`bg-neutral-2 animate-pulse rounded-lg ${className}`} />
}

function ProjectCardSkeleton() {
  return (
    <div className={`${CARD_BASE} flex w-full flex-col gap-6 p-6`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <Bone className="h-6 w-40" />
          <Bone className="h-6 w-16 rounded-[3px]" />
        </div>
        <Bone className="size-5 shrink-0 rounded-full" />
      </div>

      <div className="flex gap-10">
        <Bone className="aspect-23/8 w-2/5 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Bone className="h-6 w-14 rounded-[3px]" />
            <Bone className="h-6 w-16 rounded-[3px]" />
            <Bone className="h-6 w-20 rounded-[3px]" />
          </div>
          <div className="flex flex-col gap-1">
            <Bone className="h-4 w-20" />
            <Bone className="h-2 w-full rounded-full" />
          </div>
          <div className="flex justify-end">
            <Bone className="size-7 rounded-full" />
            <Bone className="-ml-2 size-7 rounded-full" />
            <Bone className="-ml-2 size-7 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceListSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="프로젝트 목록 불러오는 중">
      <Bone className="h-9 w-40 rounded-[10px]" />
      <div className="flex flex-col gap-10">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  )
}
