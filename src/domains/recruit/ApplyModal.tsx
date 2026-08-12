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

/** 업로드는 제출 시점에 하므로 선택한 파일 자체를 들고 있는다 */
type AttachedFile = {
  file: File
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

  // 선택 시에는 검증만 한다 — 취소·교체 시 서버에 고아 파일이 남지 않도록 업로드는 제출 시점에
  const handleFileSelect = (file: File) => {
    const invalidMessage = validateApplicationFile(file)
    setAttached({ file, error: invalidMessage ?? undefined })
  }

  const handleFileRemove = () => {
    setAttached(null)
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
      // 업로드 후 반환된 id를 지원 요청의 fileIds로 넘긴다
      let fileIds: number[] = []
      if (attached && !attached.error) {
        const uploaded = await uploadApplicationFile(recruitmentId, attached.file)
        fileIds = [uploaded.id]
      }
      await onSubmit({ ...values, fileIds })
      setIsSubmitted(true)
    } catch {
      setSubmitError('지원에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 형식·용량이 맞지 않는 파일이 남아 있으면 제출을 막는다
  const isFileBlocking = attached?.error != null

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
              if (files[0]) handleFileSelect(files[0])
            }}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.zip,.mp4"
            hint="pdf, jpg, png, webp, zip, mp4 · 최대 100MB"
            disabled={submitting}
          />

          {attached && (
            <div className="bg-neutral-2 flex items-center gap-2 rounded-lg px-3 py-2">
              <span className="text-caption-lg text-neutral-9 flex-1 truncate">
                {attached.file.name}
                <span className="text-neutral-5"> · {formatFileSize(attached.file.size)}</span>
              </span>
              {attached.error && (
                <span className="text-caption-sm text-warning shrink-0">{attached.error}</span>
              )}
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
