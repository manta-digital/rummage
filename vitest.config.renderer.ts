import { defineConfig } from 'vitest/config'

export default defineConfig({
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