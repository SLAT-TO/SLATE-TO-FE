import type { ApplicationInfo } from '../../types/Recruit.types'

interface ApplicationInfoCardProps {
  application: ApplicationInfo
}

function ApplicationInfoCard({ application }: ApplicationInfoCardProps) {
  const { comment, referenceLink, fileName, fileUrl } = application

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-xs">
      <div className="grid grid-cols-[100px_1fr] items-start gap-4">
        <span className="text-caption-lg text-neutral-11 font-semibold">코멘트</span>
        <p className="text-caption-lg text-neutral-6 whitespace-pre-line">{comment}</p>
      </div>

      <div className="grid grid-cols-[100px_1fr] items-start gap-4">
        <span className="text-caption-lg text-neutral-11 font-semibold">참고 링크</span>
        {referenceLink ? (
          <a
            href={referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption-lg text-primary break-all underline"
          >
            {referenceLink}
          </a>
        ) : (
          <span className="text-caption-lg text-neutral-6">-</span>
        )}
      </div>

      <div className="grid grid-cols-[100px_1fr] items-start gap-4">
        <span className="text-caption-lg text-neutral-11 font-semibold">첨부 파일</span>
        {fileName ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption-lg text-primary break-all underline"
          >
            {fileName}
          </a>
        ) : (
          <span className="text-caption-lg text-neutral-6">-</span>
        )}
      </div>
    </section>
  )
}

export default ApplicationInfoCard
