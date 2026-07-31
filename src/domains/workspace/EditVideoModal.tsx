import { useState } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import { Button } from '../../components/Button'
import { validateField } from '../../utils/validateField'
import { updateVideoSchema } from '../../schemas/video'

interface EditVideoModalProps {
  isOpen: boolean
  initialTitle: string
  /** undefined면 메모 입력칸 자체를 숨김 (목록 카드처럼 기존 메모 값을 모를 때 실수로 비우지 않도록) */
  initialMemo?: string | null
  onClose: () => void
  onSubmit: (values: { title: string; memo?: string }) => Promise<void>
}

function EditVideoModal({
  isOpen,
  initialTitle,
  initialMemo,
  onClose,
  onSubmit,
}: EditVideoModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [memo, setMemo] = useState(initialMemo ?? '')
  const [titleError, setTitleError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    setSubmitting(false)
    onClose()
  }

  const handleSubmit = async () => {
    const message = validateField(updateVideoSchema.shape.title, title)
    if (message) {
      setTitleError(message)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(initialMemo === undefined ? { title } : { title, memo })
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex w-150 flex-col gap-5">
        <h2 className="text-head-sm text-neutral-11 font-bold">영상 수정</h2>

        <Input
          label="제목"
          value={title}
          onChange={setTitle}
          placeholder="영상 제목을 입력하세요"
          error={titleError}
          required
        />

        {initialMemo !== undefined && (
          <TextArea
            label="메모 (선택)"
            className="bg-neutral-1"
            value={memo}
            onChange={setMemo}
            placeholder="영상 관련 메모를 입력하세요"
            rows={3}
          />
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={() => void handleSubmit()} className="w-40" disabled={submitting}>
            저장하기
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
