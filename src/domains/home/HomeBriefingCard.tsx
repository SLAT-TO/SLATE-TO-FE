import type { TodayBriefing } from '../../types/schedule'

interface HomeBriefingCardProps {
  briefing: TodayBriefing | null
  loading: boolean
}

export default function HomeBriefingCard({ briefing, loading }: HomeBriefingCardProps) {
  const lines = briefing?.items.map((item) => item.title) ?? []

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-body-lg text-neutral-11 font-semibold">오늘의 브리핑</h2>

      <div className="flex h-46 flex-col items-start justify-center gap-3 rounded-[10.242px] bg-white p-4 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
        {loading && <p className="text-caption-lg text-neutral-6">불러오는 중…</p>}

        {!loading && lines.length === 0 && (
          <p className="text-caption-lg text-neutral-6">오늘은 브리핑이 없어요.</p>
        )}

        {!loading &&
          lines.map((line, i) => (
            <p
              key={i}
              className="text-caption-lg text-neutral-11 leading-[25px] font-normal tracking-[-0.32px]"
            >
              {line}
            </p>
          ))}
      </div>
    </section>
  )
}
