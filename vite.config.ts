import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 실 배포 BE 연동: VITE_API_BASE_URL 비우고 상대경로(/api)로 요청.
    // changeOrigin은 Host만 바꾸고 Origin은 그대로라, BE CORS가 localhost:5173을
    // 거부하면 403 Invalid CORS request가 난다. 허용된 FE origin으로 맞춰 보낸다.
    //
    // 예외: GET /auth/login/google은 axios(XHR)가 아니라 브라우저 최상위 내비게이션
    // (window.location.href)으로 호출되는데, 실제 브라우저는 이런 최상위 이동엔 Origin
    // 헤더를 안 보낸다. BE는 Origin 헤더가 아예 없으면 그냥 통과시키므로(curl로 확인),
    // 이 경로까지 프록시가 강제로 www.slatto.cloud를 덧씌우면 구글 인증 완료 후 BE가
    // 로컬이 아니라 그 위장한 도메인으로 콜백을 돌려보내 로컬에서 구글 로그인을 끝까지
    // 테스트할 수 없게 된다. 이 경로만 스푸핑에서 제외해 로컬 콜백이 정상적으로
    // localhost로 돌아오게 한다.
    proxy: {
      '/api': {
        target: 'https://api.slatto.cloud',
        changeOrigin: true,
        secure: true,
        // 브라우저 Origin(localhost:5173)이 그대로면 BE CORS가 403을 냄
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.url?.startsWith('/api/v1/auth/login/google')) return
            proxyReq.setHeader('Origin', 'https://www.slatto.cloud')
            // refresh CSRF는 Origin 없을 때 Referer로도 검사함
            proxyReq.setHeader('Referer', 'https://www.slatto.cloud/')
          })
        },
      },
    },
  },
})
