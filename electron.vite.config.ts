import { defineConfig, externalizeDepsPlugin, defineViteConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: resolve(__dirname, 'src/electron/main/main.ts'),
        external: ['better-sqlite3', 'sqlite-vec', 'onnxruntime-node'],
        output: { format: 'es' }
      }
    },
    resolve: {
      alias: {
        '@core': resolve(__dirname, 'src/core'),
        '@electron': resolve(__dirname, 'src/electron')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: resolve(__dirname, 'src/electron/preload/preload.ts'),
        output: { format: 'es' }
      }
    },
    resolve: {
      alias: {
        '@core': resolve(__dirname, 'src/core'),
        '@electron': resolve(__dirname, 'src/electron')
      }
    }
  },
  renderer: defineViteConfig(() => ({
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: { index: resolve(__dirname, 'index.html') }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer')
      }
    },
    plugins: [react(), tailwindcss()]
  }))
})


