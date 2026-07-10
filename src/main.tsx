import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'true') return

  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url)
      if (
        url.hostname.includes('youtube.com') ||
        url.hostname.includes('youtu.be') ||
        url.hostname.includes('vimeo.com')
      ) {
        return
      }
      print.warning()
    },
  })
}

enableMocking()
  .catch((error) => {
    console.error('MSW 초기화 실패 — mock 없이 계속 진행합니다.', error)
  })
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
