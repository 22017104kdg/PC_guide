import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PC_guide/', // GitHub Pages 리포지토리 이름과 정확히 일치해야 함!
})
