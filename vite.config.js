import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localCmsPlugin from './plugins/vite-plugin-local-cms'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    localCmsPlugin()
  ],
  base: './', // Use relative paths for GitHub Pages compatibility
})
