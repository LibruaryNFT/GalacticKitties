import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Keep root as viewer/ so node_modules resolve correctly
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  base: '/', // Use absolute paths for deployment
  server: {
    port: 5173,
    open: true,
  },
})
