import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import type { RecruitmentApplication } from '../../types/recruitment'
import { formatDateTime } from '../../utils/formatDate'

interface ApplicantRowProps {
  application: RecruitmentApplication
  onViewProfile: (applicantId: number) => void
}

function ApplicantRow({ application, onViewProfile }: ApplicantRowProps) {
  const { applicant } = application

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

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onViewProfile(applicant.id)}
        className="ml-auto w-[140px]"
      >
        프로필 보기
      </Button>
    </li>
  )
}

export default ApplicantRow
