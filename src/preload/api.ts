import { ipcRenderer } from 'electron'
import type { File, FileInfo, SearchCriteria, ScanHistory, SimilarityResult } from '../core/types'

/**
 * Preload API that exposes safe IPC methods to the renderer process
 * This creates the bridge between renderer and main process
 */

// Database operations
const db = {
  getSchemaVersion: (): Promise<string | null> => 
    ipcRenderer.invoke('db:getSchemaVersion'),
  
  setMeta: (key: string, value: string): Promise<boolean> => 
    ipcRenderer.invoke('db:setMeta', key, value),

  hasVectorSupport: (): Promise<boolean> => 
    ipcRenderer.invoke('db:hasVectorSupport')
}

// File operations
const files = {
  findById: (id: number): Promise<File | null> => 
    ipcRenderer.invoke('files:findById', id),

  findByPath: (path: string): Promise<File | null> => 
    ipcRenderer.invoke('files:findByPath', path),

  search: (criteria: SearchCriteria): Promise<File[]> => 
    ipcRenderer.invoke('files:search', criteria),

  getAllFiles: (): Promise<File[]> => 
    ipcRenderer.invoke('files:getAllFiles'),

  insert: (fileInfo: FileInfo): Promise<number> => 
    ipcRenderer.invoke('files:insert', fileInfo),

  update: (id: number, updates: Partial<File>): Promise<boolean> => 
    ipcRenderer.invoke('files:update', id, updates),

  delete: (id: number): Promise<boolean> => 
    ipcRenderer.invoke('files:delete', id),

  batchInsert: (files: FileInfo[]): Promise<number[]> => 
    ipcRenderer.invoke('files:batchInsert', files)
}

// Scan history operations
const scanHistory = {
  create: (directory: string): Promise<number> => 
    ipcRenderer.invoke('scanHistory:create', directory),

  update: (id: number, updates: Partial<ScanHistory>): Promise<boolean> => 
    ipcRenderer.invoke('scanHistory:update', id, updates),

  findByDirectory: (directory: string): Promise<ScanHistory[]> => 
    ipcRenderer.invoke('scanHistory:findByDirectory', directory),

  getRecent: (limit?: number): Promise<ScanHistory[]> => 
    ipcRenderer.invoke('scanHistory:getRecent', limit)
}

// Vector operations
const vector = {
  addTextEmbedding: (fileId: number, embedding: Float32Array | number[]): Promise<boolean> => 
    ipcRenderer.invoke('vector:addTextEmbedding', fileId, Array.from(embedding)),

  addImageEmbedding: (fileId: number, embedding: Float32Array | number[]): Promise<boolean> => 
    ipcRenderer.invoke('vector:addImageEmbedding', fileId, Array.from(embedding)),

  searchSimilar: (embedding: Float32Array | number[], limit?: number): Promise<SimilarityResult[]> => 
    ipcRenderer.invoke('vector:searchSimilar', Array.from(embedding), limit),

  removeEmbeddings: (fileId: number): Promise<boolean> => 
    ipcRenderer.invoke('vector:removeEmbeddings', fileId)
}

// Main API object
export const rummageApi = {
  // Basic connectivity
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  
  // Service APIs
  db,
  files,
  scanHistory,
  vector
}

// Type definitions for the renderer process
export type RummageApi = typeof rummageApi