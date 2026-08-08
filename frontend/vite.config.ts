import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true, // listen on 0.0.0.0 so the port is reachable from the host
    port: 5173,
    watch: {
      usePolling: true, // reliable file watching inside Docker on Windows
    },
  },
})
