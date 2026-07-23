const CARD_SHADOW = 'shadow-[0px_3.4px_12.5px_rgba(169,204,244,0.15)]'

export default function DashboardTodayScheduleCard() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">오늘 일정</h2>
      <div className={`flex min-h-[183px] flex-col justify-center rounded-[10px] bg-white p-4 ${CARD_SHADOW}`}>
        <p className="text-caption-lg text-neutral-6">일정 API 연결 전입니다. 이후 오늘 일정을 표시합니다.</p>
      </div>
    </section>
  )
}
