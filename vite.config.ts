import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps every asset URL relative, so the build works from the
// domain root (public_html) and from any sub-folder alike.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('postprocessing') || id.includes('/three/')) return 'vendor-three'
          if (id.includes('@react-three')) return 'vendor-r3f'
          if (id.includes('gsap')) return 'vendor-gsap'
          return undefined
        },
      },
    },
  },
})
