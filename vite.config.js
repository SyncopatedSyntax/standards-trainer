import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build stamp shown in Settings, so an update can be confirmed to have landed.
const BUILD_ID = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

export default defineConfig({
  // Served under /standards on the unified domain (Vercel multi-zone).
  base: '/standards/',
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  // No PWA plugin: the shell owns the single service worker + manifest for the
  // whole origin. Offline for /standards comes from the shell SW's runtime
  // caching (fretworks/public/sw.js — add "standards" to its ZONE_RE).
  plugins: [react()],
})
