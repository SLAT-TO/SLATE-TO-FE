import ProfileOverviewCard from '../domains/mypage/ProfileOverviewCard'
import ProjectHistoryCard from '../domains/mypage/ProjectHistoryCard'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'

interface UserProfilePageProps {
  userId: number
}

// TODO: API 연동 — GET /api/v1/users/:userId
const MOCK_PROFILE: ProfileSummary = {
  profileImageUrl: 'https://placehold.co/64x64',
  nickname: '김수민',
  role: '연출',
  region: '서울',
  email: 'soomin.kim@example.com',
  introduction: '사람의 이야기를 영상으로 담아내는 것을 좋아합니다.',
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
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영'],
  },
  {
    id: '2',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['프로젝트 유형', '프로젝트 길이', '촬영'],
  },
]

const HEADER = <HeaderTitle>프로필</HeaderTitle>

function UserProfilePage({ userId }: UserProfilePageProps) {
  useHeaderSlot(HEADER)
  void userId // TODO: API 연동 시 사용

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProfileOverviewCard
        profile={MOCK_PROFILE}
        projectTypeStats={MOCK_PROJECT_TYPE_STATS}
        roleStats={MOCK_ROLE_STATS}
      />

      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">프로젝트 이력</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_PROJECT_HISTORY.map((project) => (
            <ProjectHistoryCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default UserProfilePage
