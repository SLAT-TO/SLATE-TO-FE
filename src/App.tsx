import { useMemo } from 'react'
import MainLayout from './layouts/MainLayout'
import CalendarPage from './pages/CalendarPage'
import HomePage from './pages/HomePage'
import MyPage from './pages/MyPage'
import NotificationPage from './pages/NotificationPage'
import ProfileEditPage from './pages/ProfileEditPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectOverviewPage from './pages/ProjectOverviewPage'
import RecruitPage from './pages/RecruitPage'
import JobDetailPage from './pages/JobDetailPage'
import JobApplicantsPage from './pages/JobApplicantsPage'
import SettingsPage from './pages/SettingsPage'
import SettingsNotificationsPage from './pages/SettingsNotificationsPage'
import SettingsPasswordPage from './pages/SettingsPasswordPage'
import SettingsInquiryPage from './pages/SettingsInquiryPage'
import WorkspacePage from './pages/WorkspacePage'
import HeaderTitle from './components/HeaderTitle'
import MyRecruitPage from './pages/MyRecruitPage'
import JobFormPage from './pages/JobFormPage'
import { usePathname } from './hooks/usePathname'
import { useHeaderSlot } from './hooks/useHeaderSlot'
import { useAuthGuard } from './hooks/useAuthGuard'
import { renderFullscreenRoute } from './routes/fullscreen'
import { matchPath } from './utils/navigation'

const USER_NAME = '서정현' // API 연동 시 유저 정보로 교체

// 라우트별 헤더 타이틀 매핑
function getHeaderTitle(pathname: string): string {
  if (pathname === '/' || pathname === '') return `안녕하세요 ${USER_NAME} 님`
  if (pathname === '/calendar') return '통합 캘린더'
  if (pathname === '/matching') return ''
  if (pathname === '/mypage') return '마이페이지'
  if (pathname === '/mypage/edit') return '프로필 수정'
  if (pathname === '/mypage/project/new') return '프로젝트 추가'
  if (matchPath('/mypage/project/:id/edit', pathname)) return '프로젝트 수정'
  if (matchPath('/mypage/project/:id', pathname)) return '프로젝트 개요'
  return ''
}

function AppRoutes({ pathname }: { pathname: string }) {
  const headerTitle = useMemo(() => getHeaderTitle(pathname), [pathname])
  const headerContent = useMemo(
    () => (headerTitle ? <HeaderTitle>{headerTitle}</HeaderTitle> : undefined),
    [headerTitle],
  )
  useHeaderSlot(headerContent)

  // trailing slash 정규화 (/workspace/ → /workspace)
  const path = pathname.replace(/\/+$/, '') || '/'

  const projectMatch = matchPath('/workspace/projects/:projectId', path)
  if (projectMatch) {
    const projectId = Number(projectMatch.projectId)
    if (!Number.isFinite(projectId)) {
      return <p className="text-body-sm text-warning">잘못된 프로젝트 경로입니다.</p>
    }
    return <ProjectDetailPage key={projectId} projectId={projectId} />
  }

  if (path === '/workspace') {
    return <WorkspacePage />
  }

  if (path === '/notifications') {
    return <NotificationPage />
  }

  if (path === '/calendar') {
    return <CalendarPage />
  }

  if (path === '/matching/my') {
    return <MyRecruitPage />
  }

  if (path === '/matching/new') {
    return <JobFormPage />
  }

  const applicantsMatch = matchPath('/matching/:jobId/applicants', path)
  if (applicantsMatch) {
    const jobId = Number(applicantsMatch.jobId)
    if (!Number.isFinite(jobId)) {
      return <p className="text-body-sm text-warning">잘못된 공고 경로입니다.</p>
    }
    return <JobApplicantsPage jobId={jobId} />
  }

  const jobMatch = matchPath('/matching/:jobId', path)
  if (jobMatch) {
    const jobId = Number(jobMatch.jobId)
    if (!Number.isFinite(jobId)) {
      return <p className="text-body-sm text-warning">잘못된 공고 경로입니다.</p>
    }
    return <JobDetailPage jobId={jobId} />
  }

  if (path === '/matching') {
    return <RecruitPage />
  }

  if (path === '/settings') return <SettingsPage />
  if (path === '/settings/notifications') return <SettingsNotificationsPage />
  if (path === '/settings/password') return <SettingsPasswordPage />
  if (path === '/settings/inquiry') return <SettingsInquiryPage />

  if (path === '/mypage') return <MyPage />
  if (path === '/mypage/edit') return <ProfileEditPage />
  if (path === '/mypage/project/new') return <ProjectFormPage mode="create" />

  if (matchPath('/mypage/project/:id/edit', path)) {
    return <ProjectFormPage mode="edit" />
  }

  if (matchPath('/mypage/project/:id', path)) {
    return <ProjectOverviewPage />
  }

  if (path === '/') {
    return <HomePage />
  }

  // /project-invitations/:token 등 화면 라우트는 각 기능 PR에서 여기에 추가

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-head-sm text-neutral-11 font-bold">준비 중</h1>
      <p className="text-body-sm text-neutral-6">
        <code className="text-caption-lg">{pathname}</code> 화면은 아직 없습니다.
      </p>
    </section>
  )
}

function App() {
  const pathname = usePathname()
  useAuthGuard(pathname)

  const fullscreen = renderFullscreenRoute(pathname)
  if (fullscreen) return fullscreen

  return (
    <MainLayout userName={USER_NAME}>
      <AppRoutes pathname={pathname} />
    </MainLayout>
  )
}

export default App
