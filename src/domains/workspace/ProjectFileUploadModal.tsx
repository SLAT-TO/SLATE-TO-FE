import { useState } from 'react'
import { pinProjectFile, uploadProjectFile } from '../../api/projects'
import { Button } from '../../components/Button'
import FileInput from '../../components/FileInput'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
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

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
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
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const [pinned, setPinned] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const resetAndClose = (force = false) => {
    if (uploading && !force) return
    setQueuedFiles([])
    setFileName('')
    setDescription('')
    setPinned(false)
    setError('')
    onClose()
  }

  const addFiles = (files: File[]) => {
    setQueuedFiles((previous) => {
      const existingKeys = new Set(previous.map(getFileKey))
      const nextFiles = files.filter((file) => !existingKeys.has(getFileKey(file)))
      if (previous.length === 0 && nextFiles[0] && !fileName.trim()) {
        setFileName(nextFiles[0].name)
      }
      return [...previous, ...nextFiles]
    })
    setError('')
  }

  const removeFile = (file: File) => {
    setQueuedFiles((previous) => previous.filter((item) => item !== file))
    setError('')
  }

  const handleUpload = async () => {
    if (queuedFiles.length === 0) {
      setError('업로드할 파일을 추가해 주세요.')
      return
    }

    if (queuedFiles.length === 1 && !fileName.trim()) {
      setError('파일명을 입력해 주세요.')
      return
    }

    setUploading(true)
    setError('')
    let uploadedCount = 0

    try {
      for (const file of queuedFiles) {
        const uploaded = await uploadProjectFile(projectId, file, {
          fileName: queuedFiles.length === 1 ? fileName.trim() : file.name,
          description: description.trim() || undefined,
        })
        uploadedCount += 1
        setQueuedFiles((previous) => previous.filter((item) => item !== file))

        if (pinned) {
          try {
            await pinProjectFile(projectId, uploaded.id)
          } catch {
            window.alert('파일은 업로드됐지만 즐겨찾기를 적용하지 못했습니다.')
          }
        }
      }

      await onUploaded()
      resetAndClose(true)
    } catch (uploadError) {
      if (uploadedCount > 0) await onUploaded()
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
          <span className="relative">
            <input
              value={queuedFiles.length > 1 ? '' : fileName}
              onChange={(event) => {
                setFileName(event.target.value)
                setError('')
              }}
              placeholder={
                queuedFiles.length > 1
                  ? '여러 파일은 각각 원본 파일명으로 저장됩니다.'
                  : '파일명을 입력해 주세요.'
              }
              disabled={uploading || queuedFiles.length > 1}
              className="bg-neutral-2 text-body-sm text-neutral-11 placeholder:text-neutral-5 border-neutral-3 h-12 w-full rounded-lg border px-4 pr-12 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setPinned((value) => !value)}
              disabled={uploading}
              aria-label={pinned ? '즐겨찾기 해제' : '즐겨찾기'}
              className={`absolute top-1/2 right-3 -translate-y-1/2 disabled:cursor-not-allowed ${
                pinned ? 'text-caution' : 'text-neutral-5'
              }`}
            >
              <InlineIcon svg={starIcon} className="size-5" />
            </button>
          </span>
          {queuedFiles.length > 1 && (
            <span className="text-caption-sm text-neutral-6">
              여러 파일은 각각의 원본 파일명으로 저장됩니다.
            </span>
          )}
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

        <FileInput
          value={[]}
          onChange={addFiles}
          accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
          multiple
          disabled={uploading}
          maxSizeBytes={MAX_FILE_SIZE_BYTES}
          onInvalidFiles={(files) => setError(getFileValidationError(files[0]!) ?? '')}
          hint="PNG, PDF, Word, JPG 파일을 최대 100MB까지 추가할 수 있습니다."
          error={error || undefined}
        />

        <section
          className="border-neutral-3 overflow-hidden rounded-lg border"
          aria-label="업로드 대기 파일"
        >
          <div className="bg-neutral-2 grid grid-cols-[minmax(0,1fr)_64px_52px] gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_100px_80px] sm:gap-3">
            <span className="text-caption-lg text-neutral-8 font-semibold">파일명</span>
            <span className="text-caption-lg text-neutral-8 font-semibold">파일 크기</span>
            <span className="text-caption-lg text-neutral-8 text-right font-semibold">관리</span>
          </div>
          {queuedFiles.length === 0 ? (
            <p className="text-caption-lg text-neutral-6 px-4 py-8 text-center">
              드래그 앤 드롭하거나 클릭해 파일을 추가해 주세요.
            </p>
          ) : (
            <ul className="divide-neutral-3 divide-y">
              {queuedFiles.map((file) => (
                <li
                  key={getFileKey(file)}
                  className="grid grid-cols-[minmax(0,1fr)_64px_52px] items-center gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_100px_80px] sm:gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <InlineIcon svg={documentIcon} className="text-neutral-6 size-4 shrink-0" />
                    <span className="text-body-sm text-neutral-10 truncate">{file.name}</span>
                  </span>
                  <span className="text-caption-lg text-neutral-6">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    disabled={uploading}
                    className="text-caption-lg text-neutral-7 hover:text-warning justify-self-end disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

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
