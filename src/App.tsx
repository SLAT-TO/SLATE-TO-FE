import MainLayout from './layouts/MainLayout'
import { usePathname } from './hooks/usePathname'

function AppRoutes({ pathname }: { pathname: string }) {
  if (pathname === '/' || pathname === '') {
    return (
      <section className="flex flex-col gap-2">
        <h1 className="text-head-sm text-neutral-11 font-bold">홈</h1>
        <p className="text-body-sm text-neutral-6">홈 대시보드는 이후 조립 예정입니다.</p>
      </section>
    )
  }

  // /workspace, /invitations/:token 등 화면 라우트는 각 기능 PR에서 여기에 추가

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-head-sm text-neutral-11 font-bold">준비 중</h1>
      <p className="text-body-sm text-neutral-6">
        <code className="text-caption-lg">{pathname}</code> 화면은 아직 없습니다.
      </p>
    </section>
  )
}

/** /login 등 — 각 기능 PR에서 경로 추가 */
const FULLSCREEN_PATHS: string[] = []

function App() {
  const pathname = usePathname()

  if (FULLSCREEN_PATHS.includes(pathname)) {
    // return <LoginPage /> 등
  }

  return (
    <MainLayout userName="김수민">
      <AppRoutes pathname={pathname} />
    </MainLayout>
  )
}

export default App
