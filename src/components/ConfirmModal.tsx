import Modal from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isPending?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  isPending = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isPending && onClose()}>
      <div className="w-80 text-center">
        <h2 className="text-head-sm text-neutral-11 font-semibold break-keep">{title}</h2>
        {description && (
          <p className="text-body-sm text-neutral-6 mt-2 break-keep">{description}</p>
        )}
        <div className="mt-6 flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmText}
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
