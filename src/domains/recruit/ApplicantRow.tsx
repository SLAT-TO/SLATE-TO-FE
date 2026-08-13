import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import Tag from '../../components/Tag'
import ConfirmModal from '../../components/ConfirmModal'
import type { ApplicationStatusValue, RecruitmentApplication } from '../../types/recruitment'
import { formatDateTime } from '../../utils/formatDate'
import { updateApplicationStatus } from '../../api/recruitments'

interface ApplicantRowProps {
  recruitmentId: number
  application: RecruitmentApplication
  onViewProfile: () => void
  onStatusChange: (applicationId: number, status: ApplicationStatusValue) => void
}

type DecidedStatus = Exclude<ApplicationStatusValue, 'PENDING'>

const STATUS_LABEL: Record<DecidedStatus, string> = {
  ACCEPTED: '수락함',
  REJECTED: '거절함',
}

function ApplicantRow({
  recruitmentId,
  application,
  onViewProfile,
  onStatusChange,
}: ApplicantRowProps) {
  const { applicant, applicationStatus } = application
  const [pendingAction, setPendingAction] = useState<DecidedStatus | null>(null)

  // BE는 PENDING 지원만 상태 변경을 허용하므로 이 액션은 되돌릴 수 없다
  const handleConfirm = () => {
    if (!pendingAction) return
    const nextStatus = pendingAction
    setPendingAction(null)
    updateApplicationStatus(recruitmentId, application.applicationId, { status: nextStatus })
      .then(() => onStatusChange(application.applicationId, nextStatus))
      .catch(() => window.alert('지원 상태를 변경하지 못했습니다. 다시 시도해주세요.'))
  }

  return (
    <li className="bg-bg-primary shadow-card grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-4 rounded-xl px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar src={applicant.profileImageUrl ?? undefined} alt={applicant.nickname} size={32} />
        <span className="text-caption-lg text-neutral-11 font-semibold">{applicant.nickname}</span>
      </div>

      <span className="text-caption-lg text-neutral-6">
        {formatDateTime(application.appliedAt)}
      </span>

      <span className="text-caption-lg text-neutral-6 truncate">{applicant.bio ?? '—'}</span>

      <div className="ml-auto flex items-center gap-2">
        {applicationStatus === 'PENDING' ? (
          <>
            <Button
              variant="negativeOutline"
              size="sm"
              width={72}
              onClick={() => setPendingAction('REJECTED')}
            >
              거절
            </Button>
            <Button
              variant="primary"
              size="sm"
              width={72}
              onClick={() => setPendingAction('ACCEPTED')}
            >
              수락
            </Button>
          </>
        ) : (
          <Tag
            variant={applicationStatus === 'ACCEPTED' ? 'secondary' : 'ghost'}
            className="min-w-[72px]"
          >
            {STATUS_LABEL[applicationStatus]}
          </Tag>
        )}

        <Button variant="secondary" size="sm" onClick={() => onViewProfile()} className="w-[140px]">
          프로필 보기
        </Button>
      </div>

      <ConfirmModal
        isOpen={pendingAction != null}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirm}
        title={pendingAction === 'ACCEPTED' ? '지원자를 수락할까요?' : '지원자를 거절할까요?'}
        description="상태 변경 후에는 되돌릴 수 없어요."
        confirmText={pendingAction === 'ACCEPTED' ? '수락하기' : '거절하기'}
      />
    </li>
  )
}

export default ApplicantRow
