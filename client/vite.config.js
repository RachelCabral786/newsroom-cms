import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Tailwind V3 is configured via PostCSS, so we remove the V4 plugin reference here.
// import tailwindcss from '@tailwindcss/vite' 

// https://vitejs.dev/config/
export default defineConfig({
  // We only include the React plugin now. PostCSS configuration is handled separately.
  plugins: [react()], 
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})