import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 배경 스크롤 방지
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // 열릴 때 모달로 포커스 이동
  useEffect(() => {
    if (isOpen) {
      contentRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="bg-neutral-11/50 fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="bg-bg-primary rounded-lg p-6 shadow-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
