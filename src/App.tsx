import { lazy, Suspense, useEffect, useMemo } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HeaderTitle from './components/HeaderTitle'
import { useHeaderSlot } from './hooks/useHeaderSlot'
import { useAuthGuard } from './hooks/useAuthGuard'
import { renderFullscreenRoute } from './routes/fullscreen'
import NavigateBridge from './routes/NavigateBridge'
import { workspaceRoutes } from './routes/workspace'
import { matchPath } from './utils/navigation'
import { useUserStore } from './stores/userStore'
import { RouteLoadingBoundary, RouteLoadingFallback } from './components/RouteLoadingBoundary'

const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const MyPage = lazy(() => import('./pages/MyPage'))
const NotificationPage = lazy(() => import('./pages/NotificationPage'))
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'))
const ProjectFormPage = lazy(() => import('./pages/ProjectFormPage'))
const ProjectOverviewPage = lazy(() => import('./pages/ProjectOverviewPage'))
const RecruitPage = lazy(() => import('./pages/RecruitPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const JobApplicantsPage = lazy(() => import('./pages/JobApplicantsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const SettingsPasswordPage = lazy(() => import('./pages/SettingsPasswordPage'))
const MyRecruitPage = lazy(() => import('./pages/MyRecruitPage'))
const JobFormPage = lazy(() => import('./pages/JobFormPage'))
const ApplicantProfilePage = lazy(() => import('./pages/ApplicantProfilePage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))

function getHeaderTitle(pathname: string, userName: string): string | undefined {
  if (pathname === '/' || pathname === '')
    return userName ? `안녕하세요 ${userName} 님` : '안녕하세요'
  if (pathname === '/calendar') return '통합 캘린더'
  if (pathname === '/matching') return '구인구직'
  if (pathname === '/mypage') return '마이페이지'
  if (pathname === '/mypage/edit') return '프로필 수정'
  if (pathname === '/mypage/project/new') return '프로젝트 추가'
  if (matchPath('/mypage/project/:id/edit', pathname)) return '프로젝트 수정'
  if (matchPath('/mypage/project/:id', pathname)) return '프로젝트 개요'
  return undefined
}

/** 아직 React Router로 옮기지 않은 화면 — 워크스페이스는 workspaceRoutes 담당 */
function LegacyAppRoutes() {
  const pathname = useLocation().pathname
  const userName = useUserStore((s) => s.user?.nickname ?? '')
  const headerTitle = useMemo(() => getHeaderTitle(pathname, userName), [pathname, userName])
  const headerContent = useMemo(
    () => (headerTitle === undefined ? undefined : <HeaderTitle>{headerTitle}</HeaderTitle>),
    [headerTitle],
  )
  useHeaderSlot(headerContent)

  const path = pathname.replace(/\/+$/, '') || '/'

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
    return <JobFormPage mode="create" />
  }

  const jobEditMatch = matchPath('/matching/:jobId/edit', path)
  if (jobEditMatch) {
    const jobId = Number(jobEditMatch.jobId)
    if (!Number.isFinite(jobId)) {
      return <p className="text-body-sm text-warning">잘못된 공고 경로입니다.</p>
    }
    return <JobFormPage key={jobId} mode="edit" jobId={jobId} />
  }

  const applicantProfileMatch = matchPath('/matching/:jobId/applicants/:applicationId', path)
  if (applicantProfileMatch) {
    const jobId = Number(applicantProfileMatch.jobId)
    const applicationId = Number(applicantProfileMatch.applicationId)
    if (!Number.isFinite(jobId) || !Number.isFinite(applicationId)) {
      return <p className="text-body-sm text-warning">잘못된 지원자 경로입니다.</p>
    }
    return <ApplicantProfilePage key={applicationId} jobId={jobId} applicationId={applicationId} />
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

  const userProfileMatch = matchPath('/users/:userId', path)
  if (userProfileMatch) {
    const userId = Number(userProfileMatch.userId)
    if (!Number.isFinite(userId)) {
      return <p className="text-body-sm text-warning">잘못된 프로필 경로입니다.</p>
    }
    return <UserProfilePage key={userId} userId={userId} />
  }

  if (path === '/matching') {
    return <RecruitPage />
  }

  if (path === '/settings') return <SettingsPage />
  if (path === '/settings/password') return <SettingsPasswordPage />

  if (path === '/mypage') return <MyPage />
  if (path === '/mypage/edit') return <ProfileEditPage />
  if (path === '/mypage/project/new') return <ProjectFormPage mode="create" />

  const portfolioEditMatch = matchPath('/mypage/project/:id/edit', path)
  if (portfolioEditMatch) {
    const portfolioId = Number(portfolioEditMatch.id)
    if (!Number.isFinite(portfolioId)) {
      return <p className="text-body-sm text-warning">잘못된 프로젝트 경로입니다.</p>
    }
    return <ProjectFormPage key={portfolioId} mode="edit" portfolioId={portfolioId} />
  }

  const portfolioMatch = matchPath('/mypage/project/:id', path)
  if (portfolioMatch) {
    const portfolioId = Number(portfolioMatch.id)
    if (!Number.isFinite(portfolioId)) {
      return <p className="text-body-sm text-warning">잘못된 프로젝트 경로입니다.</p>
    }
    return <ProjectOverviewPage key={portfolioId} portfolioId={portfolioId} />
  }

  if (path === '/') {
    return <HomePage />
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

function AppShell() {
  const pathname = useLocation().pathname
  useAuthGuard(pathname)

  const userName = useUserStore((s) => s.user?.nickname ?? '')
  const fetchUser = useUserStore((s) => s.fetchUser)

  useEffect(() => {
    void fetchUser()
  }, [fetchUser])

  const fullscreen = renderFullscreenRoute(pathname)
  if (fullscreen) {
    return (
      <RouteLoadingBoundary key={pathname}>
        <Suspense fallback={<RouteLoadingFallback />}>{fullscreen}</Suspense>
      </RouteLoadingBoundary>
    )
  }

  return (
    <MainLayout userName={userName}>
      <RouteLoadingBoundary key={pathname}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {workspaceRoutes()}
            <Route path="*" element={<LegacyAppRoutes />} />
          </Routes>
        </Suspense>
      </RouteLoadingBoundary>
    </MainLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavigateBridge />
      <AppShell />
    </BrowserRouter>
  )
}

export default App
