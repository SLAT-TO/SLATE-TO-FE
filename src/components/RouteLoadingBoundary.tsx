import { Component, type ReactNode } from 'react'

type RouteLoadingBoundaryProps = {
  children: ReactNode
}

type RouteLoadingBoundaryState = {
  hasError: boolean
}

/** 지연 로딩 청크를 받지 못했을 때 빈 화면 대신 새로고침 안내를 제공한다. */
export class RouteLoadingBoundary extends Component<
  RouteLoadingBoundaryProps,
  RouteLoadingBoundaryState
> {
  state: RouteLoadingBoundaryState = { hasError: false }

  static getDerivedStateFromError(): RouteLoadingBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-body-sm text-neutral-8">화면을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-body-sm text-primary font-semibold underline"
          >
            새로고침
          </button>
        </section>
      )
    }

    return this.props.children
  }
}

export function RouteLoadingFallback() {
  return (
    <section
      className="flex min-h-48 items-center justify-center px-4"
      aria-label="화면을 불러오는 중"
    >
      <p className="text-body-sm text-neutral-6">불러오는 중…</p>
    </section>
  )
}
