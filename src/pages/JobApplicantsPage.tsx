import { useEffect, useState } from 'react'
import ApplicantRow from '../domains/recruit/ApplicantRow'
import { getAllApplications, getRecruitment } from '../api/recruitments'
import type { RecruitmentApplication } from '../types/recruitment'
import { navigate } from '../utils/navigation'

interface JobApplicantsPageProps {
  jobId: number
}

function JobApplicantsPage({ jobId }: JobApplicantsPageProps) {
  const [title, setTitle] = useState('')
  const [applications, setApplications] = useState<RecruitmentApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [detail, items] = await Promise.all([
          getRecruitment(jobId),
          getAllApplications(jobId),
        ])
        if (ignore) return
        setTitle(detail.title)
        setApplications(items)
      } catch {
        if (!ignore) setError('지원자 목록을 불러오지 못했습니다.')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [jobId])

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-head-sm text-neutral-11 font-bold">
        [{title || '공고 제목'}] 지원자 확인
      </h2>

      <div className="flex flex-col gap-3">
        <div className="border-neutral-3 grid grid-cols-4 gap-4 border-b px-6 pb-3">
          <span className="text-caption-lg text-neutral-11 font-semibold">지원자 목록</span>
          <span className="text-caption-lg text-neutral-11 font-semibold">지원 시간</span>
          <span className="text-caption-lg text-neutral-11 font-semibold">자기소개</span>
          <span className="w-[140px]" aria-hidden />
        </div>

        {isLoading ? (
          <p className="text-caption-lg text-neutral-6 py-12 text-center">불러오는 중...</p>
        ) : error ? (
          <p className="text-caption-lg text-neutral-6 py-12 text-center">{error}</p>
        ) : (
          <>
            <span className="text-caption-sm text-neutral-6 px-6">총 {applications.length}명</span>

            {applications.length === 0 ? (
              <p className="text-caption-lg text-neutral-6 py-12 text-center">
                아직 지원자가 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {applications.map((application) => (
                  <ApplicantRow
                    key={application.applicationId}
                    application={application}
                    onViewProfile={() =>
                      navigate(`/matching/${jobId}/applicants/${application.applicationId}`)
                    }
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default JobApplicantsPage
