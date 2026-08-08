import { useId } from 'react'
import type { TodayBriefing } from '../../types/schedule'
import briefingCardBg from '../../assets/images/briefingcard-bg.png'

interface HomeBriefingCardProps {
  briefing: TodayBriefing | null
  loading: boolean
}

function BriefingLineIcon() {
  const clipId = useId()

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="absolute inset-0">
        <circle cx="20" cy="20" r="20" fill="#EDF4FF" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative">
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M18.7376 9.1461L10.0001 14.3894L1.26258 9.1461C1.07306 9.03239 0.846133 8.99862 0.631716 9.05223C0.4173 9.10583 0.232959 9.24242 0.119248 9.43194C0.0055361 9.62146 -0.0282319 9.84838 0.0253722 10.0628C0.0789764 10.2772 0.215562 10.4616 0.405081 10.5753L9.57175 16.0753C9.70136 16.1531 9.84971 16.1943 10.0009 16.1943C10.1521 16.1943 10.3005 16.1531 10.4301 16.0753L19.5968 10.5753C19.7863 10.4616 19.9229 10.2772 19.9765 10.0628C20.0301 9.84838 19.9963 9.62146 19.8826 9.43194C19.7689 9.24242 19.5845 9.10583 19.3701 9.05223C19.1557 8.99862 18.9288 9.03239 18.7392 9.1461H18.7376Z"
            fill="#1457FF"
          />
          <path
            d="M18.7376 12.9527L10.0001 18.1953L1.26258 12.9527C1.16874 12.8964 1.06473 12.8592 0.956483 12.8431C0.848239 12.827 0.737882 12.8323 0.631714 12.8589C0.525546 12.8854 0.425645 12.9326 0.337715 12.9978C0.249786 13.0629 0.175549 13.1447 0.119245 13.2386C0.0629409 13.3324 0.0256712 13.4364 0.00956407 13.5447C-0.0065431 13.6529 -0.00117232 13.7633 0.0253698 13.8694C0.0789739 14.0839 0.215559 14.2682 0.405079 14.3819L9.57175 19.8819C9.70136 19.9598 9.84971 20.0009 10.0009 20.0009C10.1521 20.0009 10.3005 19.9598 10.4301 19.8819L19.5967 14.3819C19.7863 14.2682 19.9229 14.0839 19.9765 13.8694C20.0301 13.655 19.9963 13.4281 19.8826 13.2386C19.7689 13.0491 19.5845 12.9125 19.3701 12.8589C19.1557 12.8053 18.9288 12.839 18.7392 12.9527H18.7376Z"
            fill="#1457FF"
          />
          <path
            d="M0.403903 6.96405L8.7239 11.9566C9.10912 12.1883 9.55018 12.3107 9.99974 12.3107C10.4493 12.3107 10.8904 12.1883 11.2756 11.9566L19.5956 6.96405C19.7188 6.88996 19.8207 6.78526 19.8915 6.66012C19.9623 6.53498 19.9995 6.39365 19.9995 6.24988C19.9995 6.10612 19.9623 5.96479 19.8915 5.83965C19.8207 5.71451 19.7188 5.6098 19.5956 5.53572L11.2756 0.543217C10.8903 0.311741 10.4492 0.189453 9.99974 0.189453C9.55024 0.189453 9.10921 0.311741 8.7239 0.543217L0.403903 5.53572C0.280693 5.6098 0.178745 5.71451 0.10797 5.83965C0.0371952 5.96479 0 6.10612 0 6.24988C0 6.39365 0.0371952 6.53498 0.10797 6.66012C0.178745 6.78526 0.280693 6.88996 0.403903 6.96405V6.96405Z"
            fill="#1457FF"
          />
        </g>
        <defs>
          <clipPath id={clipId}>
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
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
                <BriefingLineIcon />
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
