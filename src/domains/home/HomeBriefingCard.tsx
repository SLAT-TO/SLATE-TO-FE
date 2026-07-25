import type { TodayBriefing } from '../../types/schedule'

interface HomeBriefingCardProps {
  briefing: TodayBriefing | null
  loading: boolean
}

export default function HomeBriefingCard({ briefing, loading }: HomeBriefingCardProps) {
  const lines = briefing?.items.map((item) => item.title) ?? []

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-semibold">오늘의 브리핑</h2>

      <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-[10.242px] bg-white p-6 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
        {loading && <p className="text-body-sm text-neutral-6">불러오는 중…</p>}

        {!loading && lines.length === 0 && (
          <p className="text-body-sm text-neutral-6">오늘은 브리핑이 없어요.</p>
        )}

        {!loading &&
          lines.map((line, i) => (
            <p
              key={i}
              className="text-body-sm text-neutral-11 leading-[25px] tracking-[-0.32px] font-normal"
            >
              {line}
            </p>
          ))}
      </div>
    </section>
  )
}
