// Test setup for renderer process (jsdom environment)
import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock window.electronAPI for renderer tests
Object.defineProperty(window, 'app', {
  value: {
    ping: vi.fn(() => Promise.resolve('pong')),
    db: {
      getSchemaVersion: vi.fn(() => Promise.resolve('1')),
      setMeta: vi.fn(() => Promise.resolve(true)),
    },
  },
  writable: true,
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})