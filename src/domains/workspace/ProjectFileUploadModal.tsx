import { useState } from 'react'
import { pinProjectFile, uploadProjectFile } from '../../api/projects'
import { Button } from '../../components/Button'
import ActionMenu from '../../components/ActionMenu'
import FileInput from '../../components/FileInput'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import { useUserStore } from '../../stores/userStore'
import { formatDateTime } from '../../utils/formatDate'
import documentIcon from '../../assets/icons/document.svg?raw'
import starIcon from '../../assets/icons/star.svg?raw'

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024
const ALLOWED_FILE_EXTENSIONS = ['.png', '.pdf', '.doc', '.docx', '.jpg', '.jpeg']
const ALLOWED_FILE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

/** 한 번에 파일 하나만 추가한다 — 파일마다 이름·설명·즐겨찾기를 따로 붙이는 구조라
 * 여러 개를 동시에 받으면 그 값들을 어느 파일에 적용할지가 애매해진다. */
type QueuedFile = {
  file: File
  pinned: boolean
  /** 대기 상태에서 "최종 수정일"로 보여줄 값 — 아직 서버에 없으니 추가된 시각을 쓴다 */
  addedAt: string
}

function getFileValidationError(file: File): string | null {
  const isAllowed = ALLOWED_FILE_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  )
  if (!isAllowed || (file.type && !ALLOWED_FILE_TYPES.has(file.type))) {
    return '지원하지 않는 파일 형식입니다. PNG, PDF, Word, JPG 파일만 추가할 수 있습니다.'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) return '파일은 최대 100MB까지 업로드할 수 있습니다.'
  return null
}

type ProjectFileUploadModalProps = {
  projectId: number
  isOpen: boolean
  onClose: () => void
  onUploaded: () => Promise<void> | void
}

export default function ProjectFileUploadModal({
  projectId,
  isOpen,
  onClose,
  onUploaded,
}: ProjectFileUploadModalProps) {
  const [queuedFile, setQueuedFile] = useState<QueuedFile | null>(null)
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const uploaderName = useUserStore((state) => state.user?.nickname) ?? ''

  const resetAndClose = (force = false) => {
    if (uploading && !force) return
    setQueuedFile(null)
    setFileName('')
    setDescription('')
    setError('')
    onClose()
  }

  const addFiles = (files: File[]) => {
    const file = files[0]
    if (!file) return

    setQueuedFile({ file, pinned: false, addedAt: new Date().toISOString() })
    if (!fileName.trim()) setFileName(file.name)
    setError('')
  }

  const removeFile = () => {
    setQueuedFile(null)
    setError('')
  }

  const togglePinned = () => {
    setQueuedFile((previous) => (previous ? { ...previous, pinned: !previous.pinned } : previous))
  }

  const handleUpload = async () => {
    if (!queuedFile) {
      setError('업로드할 파일을 추가해 주세요.')
      return
    }

    if (!fileName.trim()) {
      setError('파일명을 입력해 주세요.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploaded = await uploadProjectFile(projectId, queuedFile.file, {
        fileName: fileName.trim(),
        description: description.trim() || undefined,
      })

      if (queuedFile.pinned) {
        try {
          await pinProjectFile(projectId, uploaded.id)
        } catch {
          window.alert('파일은 업로드됐지만 즐겨찾기를 적용하지 못했습니다.')
        }
      }

      await onUploaded()
      resetAndClose(true)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      className="w-[760px] max-w-[calc(100vw-32px)] !p-0"
    >
      <form
        className="bg-bg-primary flex max-h-[calc(100vh-32px)] flex-col gap-5 overflow-y-auto rounded-lg p-7"
        onSubmit={(event) => {
          event.preventDefault()
          void handleUpload()
        }}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-head-sm text-neutral-11 font-bold">파일 추가</h3>
          <p className="text-caption-lg text-neutral-6">
            파일을 추가한 뒤 저장하면 프로젝트에 업로드됩니다.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-body-sm text-neutral-11 font-semibold">파일명</span>
          <input
            value={fileName}
            onChange={(event) => {
              setFileName(event.target.value)
              setError('')
            }}
            placeholder="파일명을 입력해 주세요."
            disabled={uploading}
            className="bg-neutral-2 text-body-sm text-neutral-11 placeholder:text-neutral-5 border-neutral-3 h-12 w-full rounded-lg border px-4 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <TextArea
          value={description}
          onChange={(value) => {
            setDescription(value)
            setError('')
          }}
          placeholder="파일 설명을 입력해 주세요. (선택)"
          rows={3}
          disabled={uploading}
          label="파일 설명 (선택)"
        />

        {!queuedFile ? (
          <FileInput
            value={[]}
            onChange={addFiles}
            accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
            disabled={uploading}
            maxSizeBytes={MAX_FILE_SIZE_BYTES}
            onInvalidFiles={(files) => setError(getFileValidationError(files[0]!) ?? '')}
            hint="PNG, PDF, Word, JPG 파일을 최대 100MB까지 추가할 수 있습니다."
            error={error || undefined}
          />
        ) : (
          <section
            className="border-neutral-3 overflow-hidden rounded-lg border"
            aria-label="업로드 대기 파일"
          >
            <div className="bg-neutral-2 flex items-center gap-4 px-4 py-3">
              <span className="text-caption-lg text-neutral-8 min-w-0 flex-1 font-semibold">
                파일명
              </span>
              <span className="text-caption-lg text-neutral-8 w-32 shrink-0 font-semibold">
                최종 수정일
              </span>
              <span className="text-caption-lg text-neutral-8 w-16 shrink-0 font-semibold">
                업로드
              </span>
              <span className="w-8 shrink-0" />
              <span className="w-8 shrink-0" />
            </div>
            <ul className="divide-neutral-3 divide-y">
              <li className="flex items-center gap-4 px-4 py-3">
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <InlineIcon svg={documentIcon} className="text-neutral-6 size-4 shrink-0" />
                  <span className="text-body-sm text-neutral-10 truncate">
                    {queuedFile.file.name}
                  </span>
                </span>
                <span className="text-caption-lg text-neutral-6 w-32 shrink-0 truncate">
                  {formatDateTime(queuedFile.addedAt)}
                </span>
                <span className="text-caption-lg text-neutral-6 w-16 shrink-0 truncate">
                  {uploaderName}
                </span>
                <button
                  type="button"
                  onClick={togglePinned}
                  disabled={uploading}
                  aria-label={queuedFile.pinned ? '즐겨찾기 해제' : '즐겨찾기'}
                  aria-pressed={queuedFile.pinned}
                  className={`w-8 shrink-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                    queuedFile.pinned ? 'text-caution' : 'text-neutral-4 hover:text-neutral-6'
                  }`}
                >
                  <InlineIcon svg={starIcon} className="size-4" />
                </button>
                <ActionMenu
                  className="w-8 shrink-0"
                  disabled={uploading}
                  items={[{ action: 'delete', label: '제거', onClick: removeFile }]}
                />
              </li>
            </ul>
          </section>
        )}

        <div className="mt-1 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="submit" variant="primary" className="w-full sm:w-40" disabled={uploading}>
            {uploading ? '업로드 중…' : '저장'}
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-40"
            disabled={uploading}
            onClick={() => resetAndClose()}
          >
            취소
          </Button>
        </div>
      </form>
    </Modal>
  )
}
