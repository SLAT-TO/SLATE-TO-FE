import ActionMenu from '../../components/ActionMenu'
import InlineIcon from '../../components/InlineIcon'
import type { ProjectFileListItem } from '../../types/file'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import { CARD_BASE } from '../../styles/card'

type ProjectFileDetailViewProps = {
  file: ProjectFileListItem
  onBack: () => void
  onDownload: () => void
  onDelete: () => void
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectFileDetailView({
  file,
  onBack,
  onDownload,
  onDelete,
}: ProjectFileDetailViewProps) {
  return (
    <section className="bg-neutral-2 flex flex-col gap-5 rounded-xl p-5">
      <button
        type="button"
        onClick={onBack}
        className="text-head-sm text-neutral-11 w-fit font-bold"
      >
        ‹ 파일 목록
      </button>

      <div className="bg-bg-primary rounded-[10px] p-5 shadow-sm">
        <div className="border-neutral-4 border-b pb-4">
          <h2 className="text-body-sm text-neutral-11 font-semibold">{file.fileName}</h2>
          <p className="text-caption-lg text-neutral-6 mt-2">
            {formatDateTime(file.createdAt)} · {file.uploader.nickname}
          </p>
        </div>

        <div className="text-caption-lg text-neutral-8 flex min-h-32 flex-col gap-3 py-4">
          <p>{file.description || '파일 설명이 없습니다.'}</p>
          <p>
            {formatFileSize(file.fileSize)} · {file.contentType}
            {file.isFinal ? ' · 최종 파일' : ''}
          </p>
        </div>

        <div
          className={`bg-neutral-2 flex items-center justify-between gap-3 ${CARD_BASE} px-4 py-3`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
            <span className="text-body-sm text-neutral-11 truncate">{file.fileName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              aria-label="다운로드"
              className="text-neutral-9 hover:text-primary"
            >
              <InlineIcon svg={downloadIcon} className="size-4" />
            </button>
            <ActionMenu items={[{ action: 'delete', onClick: onDelete }]} />
          </div>
        </div>
      </div>
    </section>
  )
}
