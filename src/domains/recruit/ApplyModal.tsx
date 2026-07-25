import { useState } from 'react'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import FileInput from '../../components/FileInput'
import Input from '../../components/Input'
import { Button } from '../../components/Button'
import { validateField } from '../../utils/validateField'
import { applicationSchema, type ApplicationValues } from '../../schemas/jobApplication'

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ApplicationValues) => void
}

const INITIAL_VALUES: ApplicationValues = {
  comment: '',
  referenceLink: '',
  file: null,
}

function ApplyModal({ isOpen, onClose, onSubmit }: ApplyModalProps) {
  const [values, setValues] = useState<ApplicationValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Record<'comment' | 'referenceLink', string>>({
    comment: '',
    referenceLink: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleClose = () => {
    setValues(INITIAL_VALUES)
    setErrors({ comment: '', referenceLink: '' })
    setIsSubmitted(false)
    onClose()
  }

  const handleBlur = (field: 'comment' | 'referenceLink') => {
    const message = validateField(applicationSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const handleSubmit = () => {
    const commentError = validateField(applicationSchema.shape.comment, values.comment)
    const linkError = validateField(applicationSchema.shape.referenceLink, values.referenceLink)

    if (commentError || linkError) {
      setErrors({ comment: commentError, referenceLink: linkError })
      return
    }

    // TODO: API 연동 — POST /recruitments/:id/applications
    onSubmit(values)
    setIsSubmitted(true)
  }

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

        <FileInput
          label="파일 첨부 (선택)"
          value={values.file ? [values.file] : []}
          onChange={(files) => setValues((prev) => ({ ...prev, file: files[0] ?? null }))}
          accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
          hint="첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB"
        />

        <div className="flex justify-center gap-3">
          <Button onClick={handleSubmit} className="w-52">
            지원하기
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
