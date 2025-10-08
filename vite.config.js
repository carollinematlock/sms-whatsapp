import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // bind 0.0.0.0 for the proxy
    port: 5173,
    strictPort: true,
    watch: { usePolling: true, interval: 200 } // reliable in containers
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true
  }
})
