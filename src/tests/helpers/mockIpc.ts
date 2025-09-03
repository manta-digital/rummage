import { vi } from 'vitest'

export const createMockIpc = () => ({
  scanDirectory: vi.fn(),
  getFileMetadata: vi.fn(),
  searchFiles: vi.fn(),
  onScanProgress: vi.fn(),
  onScanComplete: vi.fn(),
  onError: vi.fn(),
  selectDirectory: vi.fn(),
  cancelScan: vi.fn(),
  removeAllListeners: vi.fn(),
})

export interface MockIpcApi {
  scanDirectory: ReturnType<typeof vi.fn>
  getFileMetadata: ReturnType<typeof vi.fn>
  searchFiles: ReturnType<typeof vi.fn>
  onScanProgress: ReturnType<typeof vi.fn>
  onScanComplete: ReturnType<typeof vi.fn>
  onError: ReturnType<typeof vi.fn>
  selectDirectory: ReturnType<typeof vi.fn>
  cancelScan: ReturnType<typeof vi.fn>
  removeAllListeners: ReturnType<typeof vi.fn>
}