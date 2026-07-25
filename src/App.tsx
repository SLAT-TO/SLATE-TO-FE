import MainLayout from './layouts/MainLayout'
import { usePathname } from './hooks/usePathname'
import { matchPath } from './utils/navigation'
import MyPage from './pages/MyPage'
import ProfileEditPage from './pages/ProfileEditPage'
import ProjectOverviewPage from './pages/ProjectOverviewPage'
import ProjectFormPage from './pages/ProjectFormPage'

const USER_NAME = '서정현' // API 연동 시 유저 정보로 교체

// 라우트별 헤더 타이틀 매핑
function getHeaderTitle(pathname: string): string {
  if (pathname === '/' || pathname === '') return `안녕하세요 ${USER_NAME} 님`
  if (pathname === '/mypage') return '마이페이지'
  if (pathname === '/mypage/edit') return '프로필 수정'
  if (pathname === '/mypage/project/new') return '프로젝트 추가'
  if (matchPath('/mypage/project/:id/edit', pathname)) return '프로젝트 수정'
  if (matchPath('/mypage/project/:id', pathname)) return '프로젝트 개요'
  return ''
}

function AppRoutes({ pathname }: { pathname: string }) {
  if (pathname === '/' || pathname === '') {
    return (
      <section className="flex flex-col gap-2">
        <h1 className="text-head-sm text-neutral-11 font-bold">홈</h1>
        <p className="text-body-sm text-neutral-6">홈 대시보드는 이후 조립 예정입니다.</p>
      </section>
    )
  }

  if (pathname === '/mypage') return <MyPage />
  if (pathname === '/mypage/edit') return <ProfileEditPage />
  if (pathname === '/mypage/project/new') return <ProjectFormPage mode="create" />

  if (matchPath('/mypage/project/:id/edit', pathname)) {
    return <ProjectFormPage mode="edit" />
  }

  if (matchPath('/mypage/project/:id', pathname)) {
    return <ProjectOverviewPage />
  }

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-head-sm text-neutral-11 font-bold">준비 중</h1>
      <p className="text-body-sm text-neutral-6">
        <code className="text-caption-lg">{pathname}</code> 화면은 아직 없습니다.
      </p>
    </section>
  )
}

const FULLSCREEN_PATHS: string[] = []

function App() {
  const pathname = usePathname()

  if (FULLSCREEN_PATHS.includes(pathname)) {
    // return <LoginPage /> 등
  }

  return (
    <MainLayout userName={USER_NAME} headerTitle={getHeaderTitle(pathname)}>
      <AppRoutes pathname={pathname} />
    </MainLayout>
  )
}

export default App
