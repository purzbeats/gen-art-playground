import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'p5': ['p5'],
          'three': ['three'],
          'monaco': ['@monaco-editor/react'],
          'vendor': ['react', 'react-dom', 'zustand', 'seedrandom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
