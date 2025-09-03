// Test setup for main process (Node.js environment)
import { vi } from 'vitest'

// Mock Electron APIs for main process tests
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/test/path'),
    whenReady: vi.fn(() => Promise.resolve()),
  },
  BrowserWindow: vi.fn(),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
  },
}))

// Global test timeout
vi.setConfig({ testTimeout: 10000 })