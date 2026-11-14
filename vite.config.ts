import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const worker_origin = 'http://127.0.0.1:8787'

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5180,
    proxy: {
      '/api': { target: worker_origin },
      '/comment': { target: worker_origin },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    proxy: {
      '/api': { target: worker_origin },
      '/comment': { target: worker_origin },
    },
  },
  build: {
    target: ['es2019', 'chrome87', 'safari14'],
    sourcemap: true,
  },
})
