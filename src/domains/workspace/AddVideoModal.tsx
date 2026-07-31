import { useState } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import { Button } from '../../components/Button'
import { validateField } from '../../utils/validateField'
import { createVideoSchema, type CreateVideoValues } from '../../schemas/video'
import { validateYoutubeUrl } from '../../api/videos'
import { ApiError } from '../../types/api'

interface AddVideoModalProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
  onCreated: (values: CreateVideoValues) => Promise<void>
}

const INITIAL_VALUES: CreateVideoValues = { title: '', youtubeUrl: '', memo: '' }

function AddVideoModal({ projectId, isOpen, onClose, onCreated }: AddVideoModalProps) {
  const [values, setValues] = useState<CreateVideoValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Record<'title' | 'youtubeUrl', string>>({
    title: '',
    youtubeUrl: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    setValues(INITIAL_VALUES)
    setErrors({ title: '', youtubeUrl: '' })
    setSubmitError('')
    setSubmitting(false)
    onClose()
  }

  const handleSubmit = async () => {
    const titleError = validateField(createVideoSchema.shape.title, values.title)
    const urlError = validateField(createVideoSchema.shape.youtubeUrl, values.youtubeUrl)
    if (titleError || urlError) {
      setErrors({ title: titleError, youtubeUrl: urlError })
      setSubmitError('')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const validation = await validateYoutubeUrl({ youtubeUrl: values.youtubeUrl, projectId })
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          youtubeUrl: validation.message || '재생할 수 없는 YouTube 링크입니다.',
        }))
        return
      }
      try {
        await onCreated(values)
        handleClose()
      } catch (err) {
        setSubmitError(
          err instanceof ApiError ? err.message : '영상을 추가하지 못했습니다. 다시 시도해주세요.',
        )
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        youtubeUrl: '영상을 확인하지 못했습니다. 다시 시도해주세요.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex w-150 flex-col gap-5">
        <h2 className="text-head-sm text-neutral-11 font-bold">새로운 영상 추가</h2>

        <Input
          label="제목"
          value={values.title}
          onChange={(value) => setValues((prev) => ({ ...prev, title: value }))}
          placeholder="영상 제목을 입력하세요"
          error={errors.title}
          required
        />

        <Input
          label="YouTube 링크"
          value={values.youtubeUrl}
          onChange={(value) => setValues((prev) => ({ ...prev, youtubeUrl: value }))}
          placeholder="https://www.youtube.com/watch?v=..."
          error={errors.youtubeUrl}
          required
        />

        <TextArea
          label="메모 (선택)"
          className="bg-neutral-1"
          value={values.memo ?? ''}
          onChange={(value) => setValues((prev) => ({ ...prev, memo: value }))}
          placeholder="영상 관련 메모를 입력하세요"
          rows={3}
        />

        {submitError ? (
          <p className="text-warning text-caption-lg text-center">{submitError}</p>
        ) : null}

        <div className="flex justify-center gap-3">
          <Button onClick={() => void handleSubmit()} className="w-40" disabled={submitting}>
            추가하기
          </Button>
          <Button variant="secondary" onClick={handleClose} className="w-40">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AddVideoModal
