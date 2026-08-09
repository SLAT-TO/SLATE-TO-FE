import Modal from '../../components/Modal'
import { Button } from '../../components/Button'

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
}

/** 북마크 등록 완료 안내 — 확인 버튼만 있는 알림형 모달 */
export default function BookmarkModal({ isOpen, onClose }: BookmarkModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[718px] px-24 py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-head-md text-neutral-11 font-bold">북마크 되었어요.</h2>
        <p className="text-body-sm text-neutral-6">
          북마크 된 공고는 프로필 '나의 구인구직 페이지'에서 볼 수 있어요
        </p>
        <Button variant="primary" size="md" className="mt-6 w-60" onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  )
}
