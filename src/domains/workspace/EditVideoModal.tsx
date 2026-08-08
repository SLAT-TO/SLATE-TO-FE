import { useState } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import { Button } from '../../components/Button'
import { validateField } from '../../utils/validateField'
import { updateVideoSchema, type UpdateVideoValues } from '../../schemas/video'
import { validateYoutubeUrl } from '../../api/videos'
import { ApiError } from '../../types/api'

interface EditVideoModalProps {
  projectId: number
  isOpen: boolean
  initialTitle: string
  initialYoutubeUrl: string
  initialMemo?: string | null
  onClose: () => void
  onSubmit: (values: UpdateVideoValues) => Promise<void>
}

function EditVideoModal({
  projectId,
  isOpen,
  initialTitle,
  initialYoutubeUrl,
  initialMemo = '',
  onClose,
  onSubmit,
}: EditVideoModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl)
  const [memo, setMemo] = useState(initialMemo ?? '')
  const [errors, setErrors] = useState<Record<'title' | 'youtubeUrl', string>>({
    title: '',
    youtubeUrl: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    setSubmitting(false)
    setSubmitError('')
    onClose()
  }

  const handleSubmit = async () => {
    const titleError = validateField(updateVideoSchema.shape.title, title)
    const urlError = validateField(updateVideoSchema.shape.youtubeUrl, youtubeUrl)
    if (titleError || urlError) {
      setErrors({ title: titleError, youtubeUrl: urlError })
      setSubmitError('')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const validation = await validateYoutubeUrl({ youtubeUrl, projectId })
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          youtubeUrl: validation.message || '재생할 수 없는 YouTube 링크입니다.',
        }))
        return
      }
      try {
        await onSubmit({ title, youtubeUrl, memo })
        handleClose()
      } catch (err) {
        setSubmitError(
          err instanceof ApiError ? err.message : '영상을 수정하지 못했습니다. 다시 시도해주세요.',
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
        <h2 className="text-head-sm text-neutral-11 font-bold">영상 수정하기</h2>

        <Input
          label="링크"
          value={youtubeUrl}
          onChange={setYoutubeUrl}
          placeholder="링크를 입력해주세요."
          error={errors.youtubeUrl}
          required
        />

        <div className="flex flex-col gap-3">
          <p className="text-caption-lg text-neutral-9 font-semibold">영상 정보 입력</p>
          <Input
            value={title}
            onChange={setTitle}
            placeholder="영상 제목을 입력해주세요."
            error={errors.title}
            required
          />
          <Input value={memo} onChange={setMemo} placeholder="영상에 관련된 메모를 입력해주세요." />
        </div>

        {submitError ? (
          <p className="text-warning text-caption-lg text-center">{submitError}</p>
        ) : null}

        <div className="flex justify-center gap-3">
          <Button onClick={() => void handleSubmit()} className="w-40" disabled={submitting}>
            확인
          </Button>
          <Button variant="secondary" onClick={handleClose} className="w-40">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditVideoModal
