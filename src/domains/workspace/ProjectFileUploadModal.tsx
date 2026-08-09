import { useState } from 'react'
import { pinProjectFile, uploadProjectFile } from '../../api/projects'
import { Button } from '../../components/Button'
import FileInput from '../../components/FileInput'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
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
    return '지원하지 않는 파일 형식입니다.'
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
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const [pinned, setPinned] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const resetAndClose = (force = false) => {
    if (uploading && !force) return
    setFile(null)
    setFileName('')
    setDescription('')
    setPinned(false)
    setError('')
    onClose()
  }

  const handleUpload = async () => {
    if (!file || !fileName.trim()) {
      setError('파일명과 업로드할 파일을 모두 입력해주세요.')
      return
    }
    const validationError = getFileValidationError(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')
    try {
      const uploaded = await uploadProjectFile(projectId, file, {
        fileName: fileName.trim(),
        description: description.trim() || undefined,
      })
      if (pinned) {
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
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="bg-bg-primary flex w-[700px] max-w-[calc(100vw-32px)] flex-col gap-5 rounded-lg p-7">
        <h3 className="text-head-sm text-neutral-11 font-bold">파일 추가</h3>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm text-neutral-11 font-semibold">파일명</span>
          <span className="relative">
            <input
              value={fileName}
              onChange={(event) => {
                setFileName(event.target.value)
                setError('')
              }}
              placeholder="파일명을 입력해주세요."
              className="bg-neutral-2 text-body-sm text-neutral-11 placeholder:text-neutral-5 border-neutral-3 h-12 w-full rounded-lg border px-4 pr-12 outline-none"
            />
            <button
              type="button"
              onClick={() => setPinned((value) => !value)}
              aria-label={pinned ? '즐겨찾기 해제' : '즐겨찾기'}
              className={`absolute top-1/2 right-3 -translate-y-1/2 ${
                pinned ? 'text-caution' : 'text-neutral-5'
              }`}
            >
              <InlineIcon svg={starIcon} className="size-5" />
            </button>
          </span>
        </label>
        <TextArea
          value={description}
          onChange={(value) => {
            setDescription(value)
            setError('')
          }}
          placeholder="파일 설명 (선택)"
          rows={3}
        />
        <FileInput
          value={file ? [file] : []}
          onChange={(files) => {
            const nextFile = files[0] ?? null
            setFile(nextFile)
            if (nextFile && !fileName.trim()) setFileName(nextFile.name)
            setError('')
          }}
          accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
          maxSizeBytes={MAX_FILE_SIZE_BYTES}
          onInvalidFiles={(files) => setError(getFileValidationError(files[0]!) ?? '')}
          hint="첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 100MB"
          error={error || undefined}
        />
        <div className="mt-1 flex justify-center gap-3">
          <Button
            variant="primary"
            className="w-40"
            disabled={uploading}
            onClick={() => void handleUpload()}
          >
            {uploading ? '업로드 중…' : '업로드'}
          </Button>
          <Button
            variant="secondary"
            className="w-40"
            disabled={uploading}
            onClick={() => resetAndClose()}
          >
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}
