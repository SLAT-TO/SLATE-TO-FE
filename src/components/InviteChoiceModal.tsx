import Modal from './Modal'
import { Button } from './Button'

interface InviteChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: () => void
  onSelectGuest: () => void
}

/** ConfirmModal과 동일한 톤(제목+설명+버튼)으로, 확인/취소 대신 두 초대 방식 중 하나를 고른다. */
export default function InviteChoiceModal({
  isOpen,
  onClose,
  onSelectProject,
  onSelectGuest,
}: InviteChoiceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 text-center">
        <h2 className="text-head-sm text-neutral-11 font-semibold break-keep">
          어떻게 초대할까요?
        </h2>
        <p className="text-body-sm text-neutral-6 mt-2 break-keep">
          팀원으로 초대하거나, 로그인 없이 특정 영상 피드백만 볼 수 있는 게스트로 초대할 수 있어요.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" size="md" className="w-full" onClick={onSelectProject}>
            프로젝트 초대하기
          </Button>
          <Button variant="secondary" size="md" className="w-full" onClick={onSelectGuest}>
            게스트 초대하기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
