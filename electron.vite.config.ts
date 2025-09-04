import { defineConfig, externalizeDepsPlugin, defineViteConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { viteContentPlugin } from './src/lib/vite/vite-plugin-content'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        external: ['better-sqlite3', 'sqlite-vec', 'onnxruntime-node'],
        output: { format: 'es' }
      }
    },
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        output: { format: 'es' }
      }
    },
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload')
      }
    }
  },
  renderer: defineViteConfig(() => ({
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: { index: resolve(__dirname, 'index.html') },
        output: {
          manualChunks: {
            'ui-core': ['./src/lib/ui-core']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@manta-templates/content': fileURLToPath(
          new URL('./content', import.meta.url)
        ),
        '@/lib': resolve(__dirname, 'src/lib')
      }
    },
    plugins: [
      react(), 
      tailwindcss(),
      viteContentPlugin({
        sanitize: true,
        contentAlias: '@manta-templates/content'
      })
    ]
  }))
})