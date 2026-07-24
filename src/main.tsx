import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* 동적 import 와 msw의 start(비동기 작업)을 위한 async 함수 처리 */
async function enableMocking() {
  /* DEV:vite에서 넣어주는 값 -> 개발 서버면 true -> 개발서버가 아니거나 msw 설정이 true가 아니면 mock 작동 x */
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'true') return
  /* mock가 작동 할떄만 동적으로 import -> 성능을 위해서 -> 그냥 import는 코드 블록 내부에 넣을 수 없음 */
  const { worker } = await import('./mocks/browser')
  await worker.start({
    /* mock에서 다루지 않을 요청일때 -> 유튜브나 미리보기라면 그냥 넘어감 -> 아니면 warning 출력 */
    onUnhandledRequest(request, print) {
      /* hostname을 쉽게 추출하기 위한 url 객체 생성 */
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
/* 함수 실행 */
enableMocking()
  /* 함수에서 error 감지시 콘솔에 로깅 -> 앱은 계속 실행 */
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
