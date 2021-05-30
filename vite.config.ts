import { defineConfig } from 'vite'
import preactPreset from '@preact/preset-vite'

export default defineConfig({
  plugins: [preactPreset()],
  server: {
    open: true,
  },
  build: {
    outDir: 'docs',
    assetsDir: '.',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          y: ['yjs', 'y-indexeddb', 'y-webrtc'],
        },
      },
    },
  },
})
