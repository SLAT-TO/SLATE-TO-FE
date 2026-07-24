// src/pages/MyPage.tsx
import ProfileOverviewCard from '../components/ProfileOverviewCard'
import ProjectHistoryCard from '../components/ProjectHistoryCard'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'

// TODO(재희): 아래 하드코딩 데이터는 추후 API 연동 시 교체
// GET /api/users/me, GET /api/users/me/stats, GET /api/users/me/projects 등으로 대체 예정
// 라벨(브랜드 영상, 연출 등)은 constants/videoCategories.ts, constants/roles.ts에
// 이미 정의된 값이 있을 수 있음 - 확인 후 하드코딩 문자열을 상수 참조로 교체할 것
const MOCK_PROFILE: ProfileSummary = {
  profileImageUrl: 'https://placehold.co/64x64',
  nickname: '서정현',
  role: '연출자',
  region: '서울',
  email: 'jseo0508@gmail.com',
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
    tags: ['단편', '촬영감독', '프로젝트유형'],
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
  // TODO(재희): 프로필 수정 폼(Frame 2147229201) 라우트 확정되면 이동 로직 연결
  const handleEditClick = () => {
    // TODO: 프로필 수정 페이지로 이동
  }

  // TODO(재희): 프로젝트 수정 폼(Frame 2147229203)으로 이동하는 라우팅 연결 필요
  const handleProjectEdit = (id: string) => {
    console.log('프로젝트 수정:', id)
  }

  // TODO(재희): 삭제 확인 모달(ConfirmModal) 연결 + 실제 삭제 API 연동 필요
  const handleProjectDelete = (id: string) => {
    console.log('프로젝트 삭제:', id)
  }

  // TODO(재희): 프로젝트 추가 폼(Frame 2147229202)으로 이동하는 라우팅 연결 필요
  const handleAddProject = () => {
    console.log('프로젝트 추가')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-text-primary text-xl font-bold">마이페이지</h1>

      {/* 프로필 + 통계 2개를 한 줄에 배치, 대략 반반 비율 */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:flex-1">
          <ProfileOverviewCard
            profile={MOCK_PROFILE}
            projectTypeStats={MOCK_PROJECT_TYPE_STATS}
            roleStats={MOCK_ROLE_STATS}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-base font-semibold">프로젝트 이력</h3>
          <button
            type="button"
            onClick={handleAddProject}
            className="border-border text-text-primary hover:bg-surface-hover rounded-md border px-3 py-1.5 text-sm"
          >
            + 추가하기
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_PROJECT_HISTORY.map((project) => (
            <ProjectHistoryCard
              key={project.id}
              project={project}
              onEdit={handleProjectEdit}
              onDelete={handleProjectDelete}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default MyPage
