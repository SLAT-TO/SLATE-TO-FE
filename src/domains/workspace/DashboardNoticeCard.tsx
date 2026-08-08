import type { ProjectNoticeListItem } from '../../types/notice'
import bellIcon from '../../assets/icons/bell.svg?raw'
import { CARD_BASE } from '../../styles/card'

/** assets/icons SVG(raw) — fill=currentColor라 부모 text 색으로 칠해짐 */
function AssetIcon({ svg, className }: { svg: string; className: string }) {
  return (
    <span
      aria-hidden
      className={`text-main-7 inline-flex shrink-0 [&_svg]:block [&_svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

interface DashboardNoticeCardProps {
  notices: ProjectNoticeListItem[]
  onExpand: () => void
}

function formatNoticeDate(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hours}:${minutes}`
}

export default function DashboardNoticeCard({ notices, onExpand }: DashboardNoticeCardProps) {
  const previewNotices = notices.slice(0, 2)

  return (
    <section className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onExpand}
        aria-label="공지 전체 보기"
        className="w-fit text-left"
      >
        <h2 className="text-head-sm text-neutral-11 font-bold">공지 사항 {'>'}</h2>
      </button>
      <button
        type="button"
        onClick={onExpand}
        aria-label="공지 전체 보기"
        className={`flex min-h-[183px] flex-col justify-center ${CARD_BASE} p-4 text-left`}
      >
        {previewNotices.length === 0 ? (
          <p className="text-caption-lg text-neutral-6">등록된 공지가 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-8">
            {previewNotices.map((notice) => {
              const dateLabel = formatNoticeDate(notice.createdAt)
              return (
                <li key={notice.id} className="flex items-start gap-5">
                  <AssetIcon svg={bellIcon} className="mt-0.5 size-[17px]" />
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className="text-body-sm text-neutral-11 line-clamp-2">{notice.title}</p>
                    <p className="text-caption-lg text-neutral-6">
                      <span className="font-semibold">{notice.writer.nickname}</span>
                      {dateLabel && ` ${dateLabel}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </button>
    </section>
  )
}
