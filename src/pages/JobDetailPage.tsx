import AuthorCard from '../domains/recruit/AuthorCard'
import JobInfoCard from '../domains/recruit/JobInfoCard'
import JobDetailHeader from '../domains/recruit/JobDetailHeader'
import { Button } from '../components/Button'
import { useState } from 'react'
import { navigate } from '../utils/navigation'
import ApplyModal from '../domains/recruit/ApplyModal'
import { MOCK_JOB_DETAILS } from '../domains/recruit/mockJobDetail'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { useNavigate, useLocation } from 'react-router-dom'

function JobDetailBackHeader() {
  const nav = useNavigate()
  const location = useLocation()
  // 앱 내부 이동일 때만 히스토리가 쌓임 (직접 진입·새 탭은 'default')
  const canGoBack = location.key !== 'default'

  return (
    <button
      type="button"
      onClick={() => (canGoBack ? nav(-1) : nav('/matching'))}
      className="text-caption-lg text-neutral-6 hover:text-neutral-9 w-fit"
    >
      &lt; 공고 목록
    </button>
  )
}

const HEADER = <JobDetailBackHeader />

interface JobDetailPageProps {
  jobId: number
}

function JobDetailPage({ jobId }: JobDetailPageProps) {
  useHeaderSlot(HEADER)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  // TODO: API 연동 — GET /recruitments/:id
  // mock에는 상세 데이터가 1건뿐이라 미존재 id는 첫 항목으로 대체
  const detail = MOCK_JOB_DETAILS.find((item) => item.id === jobId) ?? MOCK_JOB_DETAILS[0]

  if (!detail) {
    return <p className="text-body-sm text-neutral-6">공고를 찾을 수 없습니다.</p>
  }

  const isOwner = detail.isOwner

  return (
    <div className="flex flex-col gap-6">
      <JobDetailHeader detail={detail} isOwner={isOwner} />

      <div className="flex flex-col gap-5.25 lg:flex-row">
        <JobInfoCard detail={detail} />
        <AuthorCard
          author={detail.author}
          onViewProfile={() => {
            if (isOwner) {
              navigate('/mypage')
            } else {
              navigate(`/users/${detail.author.userId}`)
            }
          }}
        />
      </div>

      <section className="bg-bg-primary shadow-card min-h-70 rounded-xl p-6">
        <p className="text-caption-lg text-neutral-6 whitespace-pre-wrap">{detail.description}</p>
      </section>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => {
            if (isOwner) {
              navigate(`/matching/${jobId}/applicants`)
            } else {
              setIsApplyOpen(true)
            }
          }}
          className="w-52"
        >
          {isOwner ? '지원자 확인' : '지원하기'}
        </Button>
      </div>
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={(values) => {
          // TODO: API 연동 — POST /recruitments/:id/applications
          void values
        }}
      />
    </div>
  )
}

export default JobDetailPage
