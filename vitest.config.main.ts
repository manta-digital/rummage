import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'main',
    root: './src/main',
    environment: 'node',
    setupFiles: ['../tests/setup-main.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.test.ts']
    },
    testTimeout: 10000
  }
})