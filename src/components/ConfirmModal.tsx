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
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 text-center">
        <h2 className="text-head-sm text-neutral-11 font-semibold">{title}</h2>
        {description && <p className="text-body-sm text-neutral-6 mt-2">{description}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="primary" size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
