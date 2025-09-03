// Core domain types - framework agnostic
export interface File {
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
}

export interface FileInfo {
  path: string
  name: string
  size: number
  mimeType: string
  createdAt: number
  modifiedAt: number
  hashXxh3?: string
  hashBlake3?: string
  metadata: Record<string, any>
}

export interface SearchCriteria {
  mimeTypes?: string[]
  sizeMin?: number
  sizeMax?: number
  dateRange?: {
    start: number
    end: number
  }
  textQuery?: string
  limit?: number
  offset?: number
}

export interface ScanHistory {
  id: number
  directory: string
  startedAt: number
  completedAt?: number
  filesScanned: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
}

export interface SimilarityResult {
  fileId: number
  distance: number
  file?: File
}

// Repository interfaces - defines contracts for data access
export interface FileRepository {
  findById(id: number): Promise<File | null>
  findByPath(path: string): Promise<File | null>
  search(criteria: SearchCriteria): Promise<File[]>
  insert(file: FileInfo): Promise<number>
  update(id: number, updates: Partial<File>): Promise<void>
  delete(id: number): Promise<void>
  batchInsert(files: FileInfo[]): Promise<number[]>
  getAllFiles(): Promise<File[]>
}

export interface VectorStore {
  addTextEmbedding(fileId: number, embedding: Float32Array): void
  addImageEmbedding(fileId: number, embedding: Float32Array): void
  searchSimilar(embedding: Float32Array, limit: number): SimilarityResult[]
  removeEmbeddings(fileId: number): void
  hasVectorSupport(): boolean
}

export interface ScanHistoryRepository {
  create(directory: string): Promise<number>
  update(id: number, updates: Partial<ScanHistory>): Promise<void>
  findByDirectory(directory: string): Promise<ScanHistory[]>
  getRecent(limit?: number): Promise<ScanHistory[]>
}

// Database interfaces
export interface Migration {
  version: number
  name: string
  sql: string
}

export interface DatabaseConfig {
  dbPath?: string
  enableVectorExtension?: boolean
  vectorExtensionPath?: string
}