import { ipcRenderer } from 'electron'
import type { File, FileInfo, SearchCriteria, ScanHistory, SimilarityResult } from '../core/types'
import type { ElectronAPI, IpcEvents } from '../shared/types/ipc'
import { IPC_CHANNELS } from '../shared/constants/ipc-channels'

/**
 * Preload API that exposes safe IPC methods to the renderer process
 * This creates the bridge between renderer and main process using formal contracts
 */

// Input validation helper
const validateInput = (value: any, type: string, name: string): void => {
  if (typeof value !== type) {
    throw new Error(`Invalid ${name}: expected ${type}, got ${typeof value}`)
  }
}

// Main ElectronAPI implementation using formal contracts
const electronAPI: ElectronAPI = {
  // Basic connectivity
  ping: () => ipcRenderer.invoke(IPC_CHANNELS.PING),
  
  // Database operations
  getSchemaVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SCHEMA_VERSION),
  
  setMeta: (key: string, value: string) => {
    validateInput(key, 'string', 'key')
    validateInput(value, 'string', 'value')
    return ipcRenderer.invoke(IPC_CHANNELS.SET_META, key, value)
  },

  hasVectorSupport: () => ipcRenderer.invoke(IPC_CHANNELS.HAS_VECTOR_SUPPORT),
  
  // File System Operations
  selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY),
  
  scanDirectory: (path: string) => {
    validateInput(path, 'string', 'path')
    if (!path.trim()) throw new Error('Directory path cannot be empty')
    return ipcRenderer.invoke(IPC_CHANNELS.SCAN_DIRECTORY, path)
  },
  
  cancelScan: () => ipcRenderer.invoke(IPC_CHANNELS.CANCEL_SCAN),
  
  // Database Operations
  searchFiles: (criteria: SearchCriteria) => {
    if (typeof criteria !== 'object' || criteria === null) {
      throw new Error('Search criteria must be an object')
    }
    return ipcRenderer.invoke(IPC_CHANNELS.SEARCH_FILES, criteria)
  },
  
  getFileMetadata: (fileId: number) => {
    validateInput(fileId, 'number', 'fileId')
    if (fileId <= 0) throw new Error('File ID must be positive')
    return ipcRenderer.invoke(IPC_CHANNELS.GET_FILE_METADATA, fileId)
  },
  
  getScanHistory: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SCAN_HISTORY),
  
  // Vector Search Operations
  searchSimilarImages: (embedding: Float32Array, limit = 10) => {
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Embedding must be Float32Array')
    }
    validateInput(limit, 'number', 'limit')
    return ipcRenderer.invoke(IPC_CHANNELS.VECTOR_SEARCH_SIMILAR_IMAGES, embedding, limit)
  },
  
  searchSimilarText: (embedding: Float32Array, limit = 10) => {
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Embedding must be Float32Array')
    }
    validateInput(limit, 'number', 'limit')
    return ipcRenderer.invoke(IPC_CHANNELS.VECTOR_SEARCH_SIMILAR_TEXT, embedding, limit)
  },
  
  // Application Operations
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  
  // Event listeners
  onScanProgress: (callback: IpcEvents['scan:progress']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('scan:progress', (_, data) => callback(data))
  },
  
  onScanCompleted: (callback: IpcEvents['scan:completed']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('scan:completed', (_, data) => callback(data))
  },
  
  onScanCancelled: (callback: IpcEvents['scan:cancelled']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('scan:cancelled', (_, data) => callback(data))
  },
  
  onScanError: (callback: IpcEvents['scan:error']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('scan:error', (_, data) => callback(data))
  },
  
  onAppError: (callback: IpcEvents['app:error']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('app:error', (_, data) => callback(data))
  },
  
  onAppStatus: (callback: IpcEvents['app:status']) => {
    if (typeof callback !== 'function') throw new Error('Callback must be a function')
    ipcRenderer.on('app:status', (_, data) => callback(data))
  },
  
  removeAllListeners: (channel: keyof IpcEvents) => {
    validateInput(channel, 'string', 'channel')
    ipcRenderer.removeAllListeners(channel)
  }
}

// Legacy database operations for backward compatibility
const db = {
  getSchemaVersion: electronAPI.getSchemaVersion,
  setMeta: electronAPI.setMeta,
  hasVectorSupport: electronAPI.hasVectorSupport
}

// Legacy file operations for backward compatibility  
const files = {
  findById: (id: number): Promise<File | null> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_FIND_BY_ID, id),

  findByPath: (path: string): Promise<File | null> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_FIND_BY_PATH, path),

  search: (criteria: SearchCriteria): Promise<File[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_SEARCH, criteria),

  getAllFiles: (): Promise<File[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_GET_ALL),

  insert: (fileInfo: FileInfo): Promise<number> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_INSERT, fileInfo),

  update: (id: number, updates: Partial<File>): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_UPDATE, id, updates),

  delete: (id: number): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILES_DELETE, id),

  batchInsert: (files: FileInfo[]): Promise<number[]> => 
    ipcRenderer.invoke('files:batchInsert', files)
}

// Legacy scan history operations
const scanHistory = {
  create: (directory: string): Promise<number> => 
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_HISTORY_CREATE, directory),

  update: (id: number, updates: Partial<ScanHistory>): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_HISTORY_UPDATE, id, updates),

  findByDirectory: (directory: string): Promise<ScanHistory[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_HISTORY_FIND_BY_DIRECTORY, directory),

  getRecent: (limit?: number): Promise<ScanHistory[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_HISTORY_GET_RECENT, limit)
}

// Legacy vector operations
const vector = {
  addTextEmbedding: (fileId: number, embedding: Float32Array): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.VECTOR_ADD_TEXT_EMBEDDING, fileId, Array.from(embedding)),

  addImageEmbedding: (fileId: number, embedding: Float32Array): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.VECTOR_ADD_IMAGE_EMBEDDING, fileId, Array.from(embedding)),

  searchSimilar: (embedding: Float32Array, limit: number = 10): Promise<SimilarityResult[]> => 
    ipcRenderer.invoke('vector:searchSimilar', Array.from(embedding), limit),

  removeEmbeddings: (fileId: number): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.VECTOR_REMOVE_EMBEDDINGS, fileId)
}

// Legacy API object for backward compatibility
export const rummageApi = {
  // Basic connectivity
  ping: electronAPI.ping,
  
  // Service APIs
  db,
  files,
  scanHistory,
  vector
}

// Export the formal API as the main interface
export { electronAPI }

// Type definitions for the renderer process
export type RummageApi = typeof rummageApi