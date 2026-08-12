import type { TodayBriefing } from '../../types/schedule'
import briefingCardBg from '../../assets/images/briefingcard-bg.png'
import LayersCircleIcon from '../../components/icons/LayersCircleIcon'

interface HomeBriefingCardProps {
  briefing: TodayBriefing | null
  loading: boolean
}

export default function HomeBriefingCard({ briefing, loading }: HomeBriefingCardProps) {
  const lines = briefing?.items.map((item) => item.content) ?? []

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-body-lg text-neutral-11 font-semibold">오늘의 브리핑</h2>

      <div className="flex items-center justify-between gap-4 rounded-[10.242px] bg-white py-4 pr-10.25 pl-4 shadow-[0_3.414px_24.923px_4.268px_rgba(169,204,244,0.15)]">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 pl-5.25">
          {loading && (
            <div
              role="status"
              aria-busy="true"
              aria-label="브리핑 불러오는 중"
              className="border-border-input bg-neutral-2 h-45 w-full rounded-lg border-[0.749px]"
            />
          )}

          {!loading && lines.length === 0 && (
            <p className="text-body-sm text-neutral-6">오늘은 브리핑이 없어요.</p>
          )}

          {!loading &&
            lines.map((line, i) => (
              <div key={i} className="flex items-center gap-6.5">
                <LayersCircleIcon />
                <p className="text-body-sm text-neutral-11 leading-6.25 font-normal tracking-[-0.32px]">
                  {line}
                </p>
              </div>
            ))}
        </div>

        <div className="relative isolate shrink-0" style={{ width: 308, height: 298 }}>
          <div
            className="absolute inset-8 -z-10 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(169,204,244,0.6)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              aspectRatio: '123 / 119',
              backgroundImage: `url(${briefingCardBg})`,
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </div>
    </section>
  )
}
