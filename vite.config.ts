import type { ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const worker_origin = 'http://127.0.0.1:8787'

function legacyArchive(): Plugin {
  const serveLegacy = (req: { url?: string }, res: ServerResponse, next: () => void): void => {
    const path = req.url?.split('?')[0]
    if (path === '/legacy') {
      res.statusCode = 307
      res.setHeader('Location', '/legacy/')
      res.end()
    } else if (path === '/legacy/') {
      req.url = '/legacy/index.html'
      next()
    } else {
      next()
    }
  }
  return {
    name: 'legacy-archive',
    configureServer(server) {
      server.middlewares.use(serveLegacy)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveLegacy)
    },
  }
}

export default defineConfig({
  appType: 'spa',
  plugins: [legacyArchive(), react()],
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
