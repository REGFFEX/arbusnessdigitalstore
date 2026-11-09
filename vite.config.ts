import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Date de compilation réelle, exposée au Centre d'informations (source Système).
  define: {
    __APP_BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/node_modules/**']
    }
  }
})
