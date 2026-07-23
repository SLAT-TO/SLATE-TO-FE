import type { ProjectNoticeListItem } from '../../types/notice'

const CARD_SHADOW = 'shadow-[0px_3.4px_12.5px_rgba(169,204,244,0.15)]'

interface DashboardNoticeCardProps {
  notices: ProjectNoticeListItem[]
}

function formatNoticeMeta(notice: ProjectNoticeListItem): string {
  const date = new Date(notice.createdAt)
  if (Number.isNaN(date.getTime())) return notice.writer.nickname
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${notice.writer.nickname} ${month}월 ${day}일 ${hours}:${minutes}`
}

export default function DashboardNoticeCard({ notices }: DashboardNoticeCardProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">공지 사항</h2>
      <div
        className={`flex min-h-[183px] flex-col justify-center rounded-[10px] bg-white p-4 ${CARD_SHADOW}`}
      >
        {notices.length === 0 ? (
          <p className="text-caption-lg text-neutral-6">등록된 공지가 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-8">
            {notices.map((notice) => (
              <li
                key={notice.id}
                className="border-neutral-5 flex items-center justify-between gap-3 rounded-[8px] border-[0.75px] px-4 py-3"
              >
                <span className="text-body-sm text-neutral-11 min-w-0 truncate">
                  {notice.title}
                </span>
                <span className="text-caption-lg text-neutral-6 shrink-0">
                  {formatNoticeMeta(notice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
