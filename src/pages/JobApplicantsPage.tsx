import ApplicantRow from '../domains/recruit/ApplicantRow'
import { MOCK_APPLICANTS } from '../domains/recruit/mockApplicants'
import { MOCK_JOB_DETAILS } from '../domains/recruit/mockJobDetail'
import { navigate } from '../utils/navigation'

interface JobApplicantsPageProps {
  jobId: number
}

function JobApplicantsPage({ jobId }: JobApplicantsPageProps) {
  // TODO: API 연동 — GET /recruitments/:id, GET /recruitments/:id/applications
  const detail = MOCK_JOB_DETAILS.find((item) => item.id === jobId)
  const applicants = MOCK_APPLICANTS.filter((item) => item.recruitmentId === jobId)
  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-head-sm text-neutral-11 font-bold">
        [{detail?.title ?? '공고 제목'}] 지원자 확인
      </h2>

      <div className="flex flex-col gap-3">
        <div className="border-neutral-3 grid grid-cols-4 gap-4 border-b px-6 pb-3">
          <span className="text-caption-lg text-neutral-11 font-semibold">지원자 목록</span>
          <span className="text-caption-lg text-neutral-11 font-semibold">지원 시간</span>
          <span className="text-caption-lg text-neutral-11 font-semibold">자기소개</span>
          <span className="w-[140px]" aria-hidden />
        </div>

        <span className="text-caption-sm text-neutral-6 px-6">총 {applicants.length}명</span>

        {applicants.length === 0 ? (
          <p className="text-caption-lg text-neutral-6 py-12 text-center">
            아직 지원자가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {applicants.map((applicant) => (
              <ApplicantRow
                key={applicant.id}
                applicant={applicant}
                onViewProfile={(applicantId) =>
                  navigate(`/matching/${jobId}/applicants/${applicantId}`)
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default JobApplicantsPage
