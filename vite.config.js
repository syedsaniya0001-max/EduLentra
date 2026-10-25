
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src',
  envDir: '..',
  publicDir: '../public',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
