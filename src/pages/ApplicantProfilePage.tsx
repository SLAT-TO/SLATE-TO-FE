import ProfileOverviewCard from '../domains/mypage/ProfileOverviewCard'
import ProjectHistoryCard from '../domains/mypage/ProjectHistoryCard'
import ApplicationInfoCard from '../domains/recruit/ApplicationInfoCard'
import { MOCK_APPLICANTS } from '../domains/recruit/mockApplicants'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'

interface ApplicantProfilePageProps {
  jobId: number
  applicantId: number
}

// TODO: API 연동 — GET /users/:id, GET /users/:id/stats, GET /users/:id/projects
const MOCK_PROFILE: ProfileSummary = {
  profileImageUrl: 'https://placehold.co/64x64',
  nickname: '김수민',
  role: '연출자',
  region: '서울',
  email: 'soomin.kim@example.com',
  introduction:
    '사람의 이야기를 영상으로 담아내는 것을 좋아합니다.\n함께 좋은 작품 만들어갔으면 좋겠습니다!',
}

const MOCK_PROJECT_TYPE_STATS: StatItem[] = [
  { label: '브랜드 영상', value: 8, max: 10 },
  { label: '유튜브 콘텐츠', value: 6, max: 10 },
  { label: '뮤직 비디오', value: 5, max: 10 },
]

const MOCK_ROLE_STATS: StatItem[] = [
  { label: '연출', value: 7, max: 10 },
  { label: 'PD', value: 6, max: 10 },
  { label: '편집', value: 5, max: 10 },
]

const MOCK_PROJECT_HISTORY: ProjectHistoryItem[] = [
  {
    id: '1',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영 감독'],
  },
  {
    id: '2',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영 감독'],
  },
  {
    id: '3',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영 감독'],
  },
  {
    id: '4',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영 감독'],
  },
]

const HEADER = <HeaderTitle>지원자 프로필</HeaderTitle>

function ApplicantProfilePage({ jobId, applicantId }: ApplicantProfilePageProps) {
  useHeaderSlot(HEADER)

  // TODO: API 연동 — GET /recruitments/:jobId/applications
  const applicant = MOCK_APPLICANTS.find(
    (item) => item.recruitmentId === jobId && item.applicantId === applicantId,
  )

  if (!applicant) {
    return <p className="text-body-sm text-neutral-6">지원자 정보를 찾을 수 없습니다.</p>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 프로필 — 편집 콜백 미전달로 '수정하기' 버튼 비노출 */}
      <ProfileOverviewCard
        profile={{
          ...MOCK_PROFILE,
          nickname: applicant.applicantName,
          profileImageUrl: applicant.applicantProfileImageUrl,
          introduction: applicant.introduction,
        }}
        projectTypeStats={MOCK_PROJECT_TYPE_STATS}
        roleStats={MOCK_ROLE_STATS}
      />

      {/* 지원 정보 — 마이페이지에 없는 공개 프로필 전용 영역 */}
      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">지원 정보</h3>
        <ApplicationInfoCard application={applicant} />
      </section>

      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">프로젝트 이력</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_PROJECT_HISTORY.map((project) => (
            // 편집 콜백 미전달로 케밥 메뉴 비노출, 클릭 이동도 없음
            <ProjectHistoryCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default ApplicantProfilePage
