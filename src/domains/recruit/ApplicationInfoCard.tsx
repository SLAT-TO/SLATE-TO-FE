import type { ApplicationInfo } from '../../types/Recruit.types'
import type { ApplicationFile } from '../../types/recruitment'
import { formatFileSize } from '../../utils/applicationFile'

interface ApplicationInfoCardProps {
  application: ApplicationInfo
  onDownload?: (file: ApplicationFile) => void
}

function ApplicationInfoCard({ application, onDownload }: ApplicationInfoCardProps) {
  const { comment, referenceLink, files } = application

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-xs">
      <div className="grid grid-cols-[100px_1fr] items-start gap-4">
        <span className="text-caption-lg text-neutral-11 font-semibold">코멘트</span>
        {comment ? (
          <p className="text-caption-lg text-neutral-6 whitespace-pre-line">{comment}</p>
        ) : (
          <span className="text-caption-lg text-neutral-6">-</span>
        )}
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
        {files && files.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDownload?.(file)}
                  className="text-caption-lg text-primary break-all underline"
                >
                  {file.fileName}
                </button>
                <span className="text-caption-sm text-neutral-5 shrink-0">
                  {formatFileSize(file.fileSize)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-caption-lg text-neutral-6">-</span>
        )}
      </div>
    </section>
  )
}

export default ApplicationInfoCard
