import type { File, SearchCriteria, ScanHistory, SimilarityResult } from '../../core/types'

// Request/Response Type Definitions
export interface ScanDirectoryRequest {
  path: string
  options?: {
    includeHidden?: boolean
    maxDepth?: number
    fileTypes?: string[]
  }
}

export interface ScanResult {
  success: boolean
  scanId: number
  filesFound: number
  duration: number
  error?: string
}

export interface FileMetadata {
  id: number
  path: string
  name: string
  size: number
  mimeType: string
  createdAt: number
  modifiedAt: number
  hashXxh3?: string
  hashBlake3?: string
  metadata: Record<string, any>
  detailedMetadata?: Record<string, any>
}

// Main IPC API Interface - defines all available methods
export interface IpcApi {
  // File System Operations
  selectDirectory(): Promise<string | null>
  scanDirectory(path: string): Promise<ScanResult>
  cancelScan(): Promise<void>
  
  // Database Operations
  searchFiles(criteria: SearchCriteria): Promise<File[]>
  getFileMetadata(fileId: number): Promise<FileMetadata | null>
  getScanHistory(): Promise<ScanHistory[]>
  
  // Vector Search Operations
  searchSimilarImages(embedding: Float32Array, limit?: number): Promise<SimilarityResult[]>
  searchSimilarText(embedding: Float32Array, limit?: number): Promise<SimilarityResult[]>
  
  // Application Operations
  getAppVersion(): Promise<string>
  minimizeWindow(): Promise<void>
  maximizeWindow(): Promise<void>
  closeWindow(): Promise<void>

  // Basic connectivity and database operations
  ping(): Promise<string>
  getSchemaVersion(): Promise<string | null>
  setMeta(key: string, value: string): Promise<boolean>
  hasVectorSupport(): Promise<boolean>
}

// Event interfaces for bidirectional communication
export interface IpcEvents {
  // Scan Progress Events
  'scan:started': (data: { directory: string; scanId: number }) => void
  'scan:progress': (data: { 
    scanId: number
    current: number
    total: number
    currentFile: string 
  }) => void
  'scan:completed': (data: { 
    scanId: number
    filesFound: number
    duration: number 
  }) => void
  'scan:cancelled': (data: { scanId: number }) => void
  'scan:error': (data: { scanId: number; error: string }) => void
  
  // Application Events
  'app:error': (data: { error: string; details?: any }) => void
  'app:status': (data: { status: 'ready' | 'busy' | 'error' }) => void
}

// Type for event listener setup methods
export interface IpcEventListeners {
  // Progress event listeners
  onScanProgress(callback: IpcEvents['scan:progress']): void
  onScanCompleted(callback: IpcEvents['scan:completed']): void
  onScanCancelled(callback: IpcEvents['scan:cancelled']): void
  onScanError(callback: IpcEvents['scan:error']): void
  onAppError(callback: IpcEvents['app:error']): void
  onAppStatus(callback: IpcEvents['app:status']): void
  
  // Event cleanup methods
  removeAllListeners(channel: keyof IpcEvents): void
}

// Combined interface exposed to renderer
export interface ElectronAPI extends IpcApi, IpcEventListeners {}