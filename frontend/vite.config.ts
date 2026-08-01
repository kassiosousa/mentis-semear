import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so the port is reachable from the host
    port: 5173,
    watch: {
      usePolling: true, // reliable file watching inside Docker on Windows
    },
  },
})
