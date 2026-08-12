import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// 렌더링 중 처리되지 않은 예외가 나면 리액트가 트리를 통째로 언마운트해 흰 화면만
// 남기므로, 최상위에서 잡아 최소한의 안내 + (dev에서는) 실제 에러를 보여준다.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled render error', error, errorInfo)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-head-sm text-neutral-10 font-bold">문제가 발생했어요</p>
        <p className="text-body-sm text-neutral-6">
          잠시 후 다시 시도해주세요. 계속되면 담당자에게 알려주세요.
        </p>
        {import.meta.env.DEV && (
          <pre className="text-caption-sm text-warning bg-neutral-2 max-w-2xl overflow-auto rounded-lg p-4 text-left whitespace-pre-wrap">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          새로고침
        </button>
      </div>
    )
  }
}
