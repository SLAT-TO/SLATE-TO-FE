import { useState } from 'react'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import FileInput from '../../components/FileInput'
import Input from '../../components/Input'
import { Button } from '../../components/Button'
import { validateField } from '../../utils/validateField'
import { applicationSchema, type ApplicationValues } from '../../schemas/jobApplication'
import { uploadApplicationFile } from '../../api/recruitments'
import { validateApplicationFile, formatFileSize } from '../../utils/applicationFile'

interface ApplyModalProps {
  isOpen: boolean
  recruitmentId: number
  onClose: () => void
  onSubmit: (values: ApplicationValues) => Promise<void>
}

/** 선택 즉시 업로드하므로 파일 자체가 아니라 업로드 결과를 들고 있는다 */
type AttachedFile = {
  name: string
  size: number
  /** 업로드 성공 시에만 채워진다 — 이 id만 fileIds로 보낸다 */
  id: number | null
  status: 'uploading' | 'done' | 'error'
  error?: string
}

const INITIAL_VALUES: ApplicationValues = {
  comment: '',
  referenceLink: '',
  fileIds: [],
}

function ApplyModal({ isOpen, recruitmentId, onClose, onSubmit }: ApplyModalProps) {
  const [values, setValues] = useState<ApplicationValues>(INITIAL_VALUES)
  const [attached, setAttached] = useState<AttachedFile | null>(null)
  const [errors, setErrors] = useState<Record<'comment' | 'referenceLink', string>>({
    comment: '',
    referenceLink: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleClose = () => {
    setValues(INITIAL_VALUES)
    setAttached(null)
    setErrors({ comment: '', referenceLink: '' })
    setIsSubmitted(false)
    setSubmitError(null)
    onClose()
  }

  const handleBlur = (field: 'comment' | 'referenceLink') => {
    const message = validateField(applicationSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  // 지원 API는 무효한 fileId가 하나라도 있으면 전체가 실패하므로,
  // 업로드에 성공한 id만 values.fileIds에 담는다.
  const handleFileSelect = async (file: File) => {
    const invalidMessage = validateApplicationFile(file)
    if (invalidMessage) {
      setAttached({
        name: file.name,
        size: file.size,
        id: null,
        status: 'error',
        error: invalidMessage,
      })
      setValues((prev) => ({ ...prev, fileIds: [] }))
      return
    }

    setAttached({ name: file.name, size: file.size, id: null, status: 'uploading' })
    setValues((prev) => ({ ...prev, fileIds: [] }))

    try {
      const uploaded = await uploadApplicationFile(recruitmentId, file)
      setAttached({
        name: uploaded.fileName,
        size: uploaded.fileSize,
        id: uploaded.id,
        status: 'done',
      })
      setValues((prev) => ({ ...prev, fileIds: [uploaded.id] }))
    } catch {
      setAttached({
        name: file.name,
        size: file.size,
        id: null,
        status: 'error',
        error: '업로드에 실패했습니다. 다시 시도해주세요.',
      })
    }
  }

  const handleFileRemove = () => {
    setAttached(null)
    setValues((prev) => ({ ...prev, fileIds: [] }))
  }

  const handleSubmit = async () => {
    const commentError = validateField(applicationSchema.shape.comment, values.comment)
    const linkError = validateField(applicationSchema.shape.referenceLink, values.referenceLink)

    if (commentError || linkError) {
      setErrors({ comment: commentError, referenceLink: linkError })
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
      setIsSubmitted(true)
    } catch {
      setSubmitError('지원에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 첨부를 의도했는데 빠진 채로 접수되는 일이 없도록, 업로드 중이거나 실패한 파일이 있으면 막는다
  const isFileBlocking = attached != null && attached.status !== 'done'

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="flex w-90 flex-col items-center gap-2 py-4">
          <h3 className="text-body-lg text-neutral-11 font-bold">지원이 완료되었어요.</h3>
          <p className="text-caption-lg text-neutral-6">지원해주셔서 감사합니다.</p>
          <Button onClick={handleClose} className="mt-4 w-52">
            확인
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex w-150 flex-col gap-5">
        <TextArea
          label="코멘트"
          className="bg-neutral-1"
          value={values.comment}
          onChange={(value) => setValues((prev) => ({ ...prev, comment: value }))}
          onBlur={() => handleBlur('comment')}
          placeholder="코멘트를 입력하세요"
          error={errors.comment}
          rows={3}
          required
        />

        <Input
          label="참고링크 (선택)"
          value={values.referenceLink ?? ''}
          onChange={(value) => setValues((prev) => ({ ...prev, referenceLink: value }))}
          placeholder="참고링크를 입력하세요."
          error={errors.referenceLink}
        />

        <div className="flex flex-col gap-2">
          <FileInput
            label="파일 첨부 (선택)"
            value={[]}
            onChange={(files) => {
              if (files[0]) void handleFileSelect(files[0])
            }}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.zip,.mp4"
            hint="pdf, jpg, png, webp, zip, mp4 · 최대 100MB"
            disabled={attached?.status === 'uploading'}
          />

          {attached && (
            <div className="bg-neutral-2 flex items-center gap-2 rounded-lg px-3 py-2">
              <span className="text-caption-lg text-neutral-9 flex-1 truncate">
                {attached.name}
                <span className="text-neutral-5"> · {formatFileSize(attached.size)}</span>
              </span>
              <span className="text-caption-sm shrink-0">
                {attached.status === 'uploading' && (
                  <span className="text-neutral-5">업로드 중…</span>
                )}
                {attached.status === 'done' && <span className="text-neutral-5">첨부됨</span>}
                {attached.status === 'error' && (
                  <span className="text-warning">{attached.error}</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleFileRemove}
                aria-label="첨부 파일 삭제"
                className="text-neutral-5 hover:text-neutral-9 shrink-0 px-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {submitError && <p className="text-caption-sm text-warning">{submitError}</p>}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || isFileBlocking}
            className="w-52"
          >
            {submitting ? '지원 중…' : '지원하기'}
          </Button>
          <Button variant="secondary" onClick={handleClose} className="w-52">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ApplyModal
