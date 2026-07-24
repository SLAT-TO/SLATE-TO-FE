// src/pages/MyPage.tsx
import ProfileOverviewCard from '../components/ProfileOverviewCard'
import ProjectHistoryCard from '../components/ProjectHistoryCard'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'
import { navigate } from '../utils/navigation'

// 아래 하드코딩 데이터는 추후 API 연동 시 교체
// GET /api/users/me, GET /api/users/me/stats, GET /api/users/me/projects 등으로 대체 예정
// 라벨(브랜드 영상, 연출 등)은 constants/videoCategories.ts, constants/roles.ts의 상수 참조로 교체할 것

// 빈 상태 / 일반 상태 전환용 테스트 플래그 (API 연동 시 제거)
const IS_EMPTY_TEST = false

const MOCK_PROFILE_FILLED: ProfileSummary = {
  profileImageUrl: 'https://placehold.co/64x64',
  nickname: '서정현',
  role: '연출자',
  region: '서울',
  email: 'jseo0508@gmail.com',
  introduction:
    '사람의 이야기를 영상으로 담아내는 것을 좋아합니다.\n함께 좋은 작품 만들어갔으면 좋겠습니다!',
}

const MOCK_PROFILE_EMPTY: ProfileSummary = {
  profileImageUrl: 'https://placehold.co/64x64',
  nickname: '서정현',
  role: '연출자',
  region: '',
  email: 'jseo0508@gmail.com',
  introduction: '',
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

const EMPTY_PROJECT_TYPE_STATS: StatItem[] = [
  { label: '브랜드 영상', value: 0, max: 10 },
  { label: '유튜브 콘텐츠', value: 0, max: 10 },
  { label: '뮤직 비디오', value: 0, max: 10 },
]

const EMPTY_ROLE_STATS: StatItem[] = [
  { label: '연출', value: 0, max: 10 },
  { label: 'PD', value: 0, max: 10 },
  { label: '편집', value: 0, max: 10 },
]

const MOCK_PROJECT_HISTORY: ProjectHistoryItem[] = [
  {
    id: '1',
    title: '프로젝트 명',
    thumbnailUrl: 'https://img.youtube.com/vi/hDBSEV7ZwZs/hqdefault.jpg',
    tags: ['드라마', '프로젝트 길이', '촬영감독'],
  },
  {
    id: '2',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['단편', '촬영감독', '프로젝트유형'],
  },
  {
    id: '3',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['단편', '촬영감독', '프로젝트유형'],
  },
  {
    id: '4',
    title: '프로젝트 명',
    thumbnailUrl: 'https://placehold.co/300x160',
    tags: ['단편', '촬영감독', '프로젝트유형'],
  },
]

function MyPage() {
  // 프로필 수정 폼 라우트 확정되면 이동 로직 연결
  const handleEditClick = () => {
    navigate('/mypage/edit')
  }

  // 카드 클릭->  프로젝트 개요
  const handleProjectClick = (id: string) => {
    navigate(`/mypage/project/${id}`)
  }

  // 삭제 확인 모달 연결 + 실제 삭제 API 연동 필요
  const handleProjectDelete = (id: string) => {
    console.log('프로젝트 삭제:', id)
  }

  // 프로젝트 추가 폼으로 이동하는 라우팅 연결 필요
  const handleAddProject = () => {
    navigate('/mypage/project/new')
  }

  const handleProjectEdit = (id: string) => {
    navigate(`/mypage/project/${id}/edit`)
  }

  const profile = IS_EMPTY_TEST ? MOCK_PROFILE_EMPTY : MOCK_PROFILE_FILLED
  const projectTypeStats = IS_EMPTY_TEST ? EMPTY_PROJECT_TYPE_STATS : MOCK_PROJECT_TYPE_STATS
  const roleStats = IS_EMPTY_TEST ? EMPTY_ROLE_STATS : MOCK_ROLE_STATS
  const projects = IS_EMPTY_TEST ? [] : MOCK_PROJECT_HISTORY
  const isEmpty = projects.length === 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:flex-1">
          <ProfileOverviewCard
            profile={profile}
            projectTypeStats={projectTypeStats}
            roleStats={roleStats}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-base font-semibold">프로젝트 이력</h3>
          {!isEmpty && (
            <button
              type="button"
              onClick={handleAddProject}
              className="border-primary text-primary hover:bg-main-1 rounded-md border px-3 py-1.5 text-sm"
            >
              + 추가하기
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-xl border py-14">
            <p className="text-text-secondary text-sm">
              프로젝트 이력이 없어요. 프로젝트를 추가해보세요.
            </p>
            <button
              type="button"
              onClick={handleAddProject}
              className="border-accent text-accent hover:bg-accent-subtle rounded-md border px-4 py-2 text-sm font-medium"
            >
              프로젝트 추가
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectHistoryCard
                key={project.id}
                project={project}
                onEdit={handleProjectEdit}
                onDelete={handleProjectDelete}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyPage
