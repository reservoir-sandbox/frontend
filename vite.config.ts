import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_URL?.replace(/\/api\/v1$/, '')
  
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: './',
    build: {
      outDir: 'dist'
    },
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
          secure: false
        }
      }
    }
  }
})