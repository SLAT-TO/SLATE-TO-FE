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
    proxy: {
      '/api': {
        target: 'https://api.slatto.cloud',
        changeOrigin: true,
        secure: true,
        // 브라우저 Origin(localhost:5173)이 그대로면 BE CORS가 403을 냄
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://www.slatto.cloud')
            // refresh CSRF는 Origin 없을 때 Referer로도 검사함
            proxyReq.setHeader('Referer', 'https://www.slatto.cloud/')
          })
        },
      },
    },
  },
})
