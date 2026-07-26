import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  /** 콘텐츠 박스에 덧붙일 클래스 (너비·최대높이 등). 기존 bg·radius·padding·shadow와 충돌하는 클래스는 넣지 말 것 */
  className?: string
}

export default function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="bg-neutral-11/50 fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`bg-bg-primary rounded-lg p-6 shadow-lg outline-none ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
