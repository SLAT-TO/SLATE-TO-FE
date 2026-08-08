// 월 일정(schedules) 불러오는 동안 캘린더 그리드 자리를 대신 채우는 로딩 화면
export function CalendarLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="캘린더 불러오는 중"
      className="border-border-input bg-neutral-2 flex h-full w-full items-center justify-center rounded-lg border-[0.749px] px-4 py-3"
    >
      <div className="border-neutral-3 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
    </div>
  )
}
