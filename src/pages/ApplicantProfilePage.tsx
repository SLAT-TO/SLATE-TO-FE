import { useEffect, useState } from 'react'
import ProfileOverviewCard from '../domains/mypage/ProfileOverviewCard'
import ProjectHistoryCard from '../domains/mypage/ProjectHistoryCard'
import ApplicationInfoCard from '../domains/recruit/ApplicationInfoCard'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'
import type { ApplicationInfo } from '../types/Recruit.types'
import type { RecruitmentApplicationDetail } from '../types/recruitment'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { getApplication } from '../api/recruitments'
import { getUserStats, getUserPortfolios } from '../api/users'
import { roleLabel } from '../constants/roles'
import { regionLabel } from '../constants/regions'
import { videoCategoryLabel } from '../constants/videoCategories'

interface ApplicantProfilePageProps {
  jobId: number
  applicationId: number
}

const HEADER = <HeaderTitle>지원자 프로필</HeaderTitle>
const PLACEHOLDER_THUMBNAIL = 'https://placehold.co/300x160'
const PLACEHOLDER_AVATAR = 'https://placehold.co/64x64'

/** count 최댓값을 max로 삼아 막대를 상대 비율로 표시 */
function toStatItems(list: Array<{ label: string; count: number }>): StatItem[] {
  const max = Math.max(...list.map((item) => item.count), 1)
  return list.map((item) => ({ label: item.label, value: item.count, max }))
}

function ApplicantProfilePage({ jobId, applicationId }: ApplicantProfilePageProps) {
  useHeaderSlot(HEADER)

  const [detail, setDetail] = useState<RecruitmentApplicationDetail | null>(null)
  const [projectTypeStats, setProjectTypeStats] = useState<StatItem[]>([])
  const [roleStats, setRoleStats] = useState<StatItem[]>([])
  const [projects, setProjects] = useState<ProjectHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // 지원 상세에 applicant가 함께 오므로 유저 조회는 생략
        const application = await getApplication(jobId, applicationId)
        if (cancelled) return
        setDetail(application)

        const userId = application.applicant.id
        // 통계·이력은 서로 독립이라 병렬 호출
        const [stats, portfolios] = await Promise.all([
          getUserStats(userId),
          getUserPortfolios(userId),
        ])
        if (cancelled) return

        setProjectTypeStats(toStatItems(stats.projectTypes))
        setRoleStats(toStatItems(stats.roles))
        setProjects(
          portfolios.items.map((portfolio) => ({
            id: String(portfolio.id),
            title: portfolio.title,
            thumbnailUrl: portfolio.thumbnailUrl ?? PLACEHOLDER_THUMBNAIL,
            tags: [
              videoCategoryLabel(portfolio.type),
              ...portfolio.roles.map((role) => roleLabel(role)),
            ],
          })),
        )
      } catch {
        if (!cancelled) setError('지원자 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [jobId, applicationId])

  if (isLoading) {
    return <p className="text-body-sm text-neutral-6 p-6">불러오는 중...</p>
  }

  if (error || !detail) {
    return (
      <p className="text-body-sm text-neutral-6 p-6">
        {error ?? '지원자 정보를 찾을 수 없습니다.'}
      </p>
    )
  }

  const { applicant } = detail

  const profile: ProfileSummary = {
    profileImageUrl: applicant.profileImageUrl ?? PLACEHOLDER_AVATAR,
    nickname: applicant.nickname,
    roles: applicant.primaryRole ? [roleLabel(applicant.primaryRole)] : [],
    regions: applicant.locations.map((location) => regionLabel(location)),
    // 이메일은 수락한 지원자에게만 열려 목록·상세 응답에 없음
    email: '',
    introduction: applicant.bio ?? '',
  }

  const applicationInfo: ApplicationInfo = {
    comment: detail.message,
    referenceLink: detail.referenceLink ?? undefined,
    // 파일 URL은 별도 다운로드 API — 지금은 이름만 표시
    fileName: detail.files[0]?.fileName,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 프로필 — 편집 콜백 미전달로 '수정하기' 버튼 비노출 */}
      <ProfileOverviewCard
        profile={profile}
        projectTypeStats={projectTypeStats}
        roleStats={roleStats}
      />

      {/* 지원 정보 — 마이페이지에 없는 공개 프로필 전용 영역 */}
      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">지원 정보</h3>
        <ApplicationInfoCard application={applicationInfo} />
      </section>

      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">프로젝트 이력</h3>
        {projects.length === 0 ? (
          <p className="text-caption-lg text-neutral-6 py-8 text-center">
            등록된 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              // 편집 콜백 미전달로 케밥 메뉴 비노출, 클릭 이동도 없음
              <ProjectHistoryCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ApplicantProfilePage
