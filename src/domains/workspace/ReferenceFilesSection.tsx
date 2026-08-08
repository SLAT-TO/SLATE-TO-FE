import ActionMenu from '../../components/ActionMenu'
import InlineIcon from '../../components/InlineIcon'
import type { useReferenceFiles } from '../../hooks/useReferenceFiles'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import searchIcon from '../../assets/icons/search.svg?raw'
import { formatDate } from './videoDetailFormat'

type ReferenceFilesSectionProps = Pick<
  ReturnType<typeof useReferenceFiles>,
  | 'filteredFiles'
  | 'fileSearch'
  | 'setFileSearch'
  | 'downloadReferenceFile'
  | 'removeReferenceFile'
  | 'openPicker'
>

export default function ReferenceFilesSection({
  filteredFiles,
  fileSearch,
  setFileSearch,
  downloadReferenceFile,
  removeReferenceFile,
  openPicker,
}: ReferenceFilesSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-body-sm text-neutral-11 font-semibold">참고 파일</h2>
      <div className="bg-neutral-2 border-neutral-3 flex items-center gap-2 rounded-lg border px-4 py-3">
        <input
          value={fileSearch}
          onChange={(e) => setFileSearch(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="text-body-sm text-neutral-11 placeholder:text-neutral-5 flex-1 bg-transparent outline-none"
        />
        <InlineIcon svg={searchIcon} className="text-neutral-9 size-5" />
      </div>
      {filteredFiles.length === 0 && (
        <p className="text-caption-lg text-neutral-6">참고 파일이 없습니다.</p>
      )}
      {filteredFiles.map((file) => (
        <div
          key={file.referenceFileId}
          className="bg-bg-primary border-neutral-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
            <div className="min-w-0">
              <p className="text-body-sm text-neutral-11 truncate">{file.fileName}</p>
              <p className="text-caption-lg text-neutral-6 truncate">
                업로더 · {file.uploader.nickname}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-caption-lg text-neutral-6">{formatDate(file.createdAt)}</span>
            <button
              type="button"
              onClick={() => downloadReferenceFile(file.projectFileId, file.fileName)}
              aria-label="다운로드"
              className="text-neutral-9 hover:text-primary"
            >
              <InlineIcon svg={downloadIcon} className="size-4" />
            </button>
            <ActionMenu
              items={[
                {
                  action: 'delete',
                  onClick: () => removeReferenceFile(file.referenceFileId),
                },
              ]}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={openPicker}
        className="border-primary text-primary hover:bg-primary/5 text-body-sm w-full rounded-lg border py-2 font-semibold"
      >
        파일 추가하기
      </button>
    </div>
  )
}
