import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import type { RecruitApplicant } from '../../types/Recruit.types'

interface ApplicantRowProps {
  applicant: RecruitApplicant
  onViewProfile: (applicantId: number) => void
}

function ApplicantRow({ applicant, onViewProfile }: ApplicantRowProps) {
  return (
    <li className="bg-bg-primary shadow-card grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-4 rounded-xl px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar src={applicant.applicantProfileImageUrl} alt={applicant.applicantName} size={32} />
        <span className="text-caption-lg text-neutral-11 font-semibold">
          {applicant.applicantName}
        </span>
      </div>

      <span className="text-caption-lg text-neutral-6">{applicant.appliedAt}</span>

      <span className="text-caption-lg text-neutral-6 truncate">{applicant.introduction}</span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onViewProfile(applicant.applicantId)}
        className="ml-auto w-[140px]"
      >
        프로필 보기
      </Button>
    </li>
  )
}

export default ApplicantRow
