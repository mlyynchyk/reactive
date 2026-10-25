import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // запити /api/* перенаправляються на Spring Boot бекенд -> не потрібен CORS
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
