import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@manta-templates/content': fileURLToPath(
        new URL('./content', import.meta.url)
      ),
      '@/lib': resolve(__dirname, 'lib')
    }
  },
  test: {
    name: 'renderer',
    root: './src/renderer',
    environment: 'jsdom',
    setupFiles: ['../tests/setup-renderer.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.test.tsx']
    }
  }
})