import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 실 배포 서버 연동 시 CORS 우회. VITE_API_BASE_URL 비우고 상대경로(/api)로 요청.
    proxy: {
      '/api': {
        target: 'https://api.slatto.cloud',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
