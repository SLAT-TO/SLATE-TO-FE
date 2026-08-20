import AuthorCard from '../domains/recruit/AuthorCard'
import JobInfoCard from '../domains/recruit/JobInfoCard'
import JobDetailHeader from '../domains/recruit/JobDetailHeader'
import BookmarkModal from '../domains/recruit/BookmarkModal'
import ConfirmModal from '../components/ConfirmModal'
import { applyRecruitment, deleteRecruitment } from '../api/recruitments'
import { Button } from '../components/Button'
import { useState } from 'react'
import { navigate } from '../utils/navigation'
import ApplyModal from '../domains/recruit/ApplyModal'
import { useRecruitmentDetail } from '../hooks/useRecruitmentDetail'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import { useNavigate, useLocation } from 'react-router-dom'
import { applicationStatusPresentation } from '../constants/applicationStatus'

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
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { detail, toggleBookmark, markApplied, loading, error } = useRecruitmentDetail(jobId)

  if (loading) {
    return <p className="text-body-sm text-neutral-6">불러오는 중…</p>
  }

  if (error || !detail) {
    return <p className="text-body-sm text-neutral-6">{error ?? '공고를 찾을 수 없습니다.'}</p>
  }

  // 등록 시에만 안내 모달을 띄운다 (해제 시엔 없음)
  const handleBookmarkClick = async () => {
    const nowBookmarked = await toggleBookmark()
    if (nowBookmarked) setIsBookmarkModalOpen(true)
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deleteRecruitment(jobId)
      setIsDeleteOpen(false)
      navigate('/matching/my')
    } catch (err) {
      console.error(err)
      alert('공고 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setDeleting(false)
    }
  }

  const hasApplication = detail.hasApplied || detail.myApplicationStatus != null
  const applicationButtonLabel = detail.myApplicationStatus
    ? applicationStatusPresentation(detail.myApplicationStatus).label
    : hasApplication
      ? '지원 완료'
      : '지원하기'

  return (
    <div className="flex flex-col gap-6">
      <JobDetailHeader
        detail={detail}
        onBookmarkClick={() => void handleBookmarkClick()}
        onDeleteClick={() => setIsDeleteOpen(true)}
      />

      <div className="flex flex-col gap-5.25 lg:flex-row">
        <JobInfoCard detail={detail} />
        <AuthorCard
          writer={detail.writer}
          contact={detail.contact}
          onViewProfile={() => {
            if (detail.isMine) navigate('/mypage')
            else navigate(`/users/${detail.writer.id}`)
          }}
        />
      </div>

      <section className="bg-bg-primary shadow-card min-h-70 rounded-xl p-6">
        <p className="text-caption-lg text-neutral-6 whitespace-pre-wrap">{detail.description}</p>
      </section>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => {
            if (detail.isMine) navigate(`/matching/${jobId}/applicants`)
            else setIsApplyOpen(true)
          }}
          disabled={!detail.isMine && hasApplication}
          className="w-52"
        >
          {detail.isMine ? '지원자 확인' : applicationButtonLabel}
        </Button>
      </div>

      <ApplyModal
        isOpen={isApplyOpen}
        recruitmentId={jobId}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={async (values) => {
          const result = await applyRecruitment(jobId, {
            message: values.comment,
            referenceLink: values.referenceLink || undefined,
            fileIds: values.fileIds.length > 0 ? values.fileIds : undefined,
          })
          markApplied(result.applicationStatus)
        }}
      />
      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="정말 삭제하시겠습니까?"
        description="삭제된 공고는 되돌릴 수 없어요."
      />
    </div>
  )
}

export default JobDetailPage
