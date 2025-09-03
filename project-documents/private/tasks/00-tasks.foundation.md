# Task Breakdown: Foundation Slice

---
slice_name: foundation
project: rummage
lld_reference: project-documents/private/slices/00-slice.foundation.md
dependencies: []
estimated_effort: 5-7 days
phase: "Phase 6: Slice Execution"
created: 2025-08-30
lastUpdated: 2025-08-31
status: ready_for_execution
---

## Context Summary

The foundation slice establishes the core infrastructure for the Rummage application, including Electron setup, testing framework, database layer with vector search, IPC architecture, and minimal UI shell. This slice enables all subsequent feature development with a strong emphasis on Test-Driven Development.

**Key Technical Stack:**
- Electron with secure IPC architecture
- SQLite with sqlite-vec extension for vector storage
- Vitest testing framework with separate main/renderer configs
- React UI with Radix UI primitives
- TypeScript throughout

**Success Criteria:**
- Electron app starts and shows minimal UI
- Can select and scan a directory
- Files stored in SQLite with vector capabilities
- Bidirectional IPC communication working
- >80% test coverage achieved
- Cross-platform compatibility (Windows, macOS, Linux)

## Granular Tasks

### Day 1: Testing Infrastructure Setup

#### Install and Configure Vitest Environment
- [x] Install core Vitest dependencies
  - [x] Install Vitest packages
    1. Run:
       ```bash
       npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node
       ```
  - [x] Verify installation completed without errors
  - [x] Success: All testing dependencies installed

- [x] Create main process test configuration
  - [x] Create `vitest.config.main.ts` file
    1. Add configuration for Node.js environment:
       ```typescript
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
       ```
  - [x] Success: Main process test config created

- [x] Create renderer process test configuration  
  - [x] Create `vitest.config.renderer.ts` file
    1. Add configuration for jsdom environment:
       ```typescript
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
       ```
  - [x] Success: Renderer process test config created

- [x] Configure test scripts in package.json
  - [x] Add test scripts to package.json
    1. Add the following scripts:
       ```json
       {
         "scripts": {
           "test": "pnpm run test:main && pnpm run test:renderer",
           "test:main": "vitest --config vitest.config.main.ts",
           "test:renderer": "vitest --config vitest.config.renderer.ts", 
           "test:coverage": "pnpm run test -- --coverage",
           "test:ui": "vitest --ui"
         }
       }
       ```
  - [x] Verify `pnpm test` command runs both configurations
  - [x] Success: Test scripts working correctly

#### Create Mock Utilities and Test Infrastructure
- [x] Create mock IPC bridge implementation
  - [x] Create `src/tests/helpers/mockIpc.ts` file
    1. Implement mock IPC methods:
       ```typescript
       export const createMockIpc = () => ({
         scanDirectory: vi.fn(),
         getFileMetadata: vi.fn(),
         searchFiles: vi.fn(),
         onScanProgress: vi.fn(),
         onScanComplete: vi.fn(),
         onError: vi.fn()
       })
       ```
  - [x] Add TypeScript interface matching real IPC API
  - [x] Success: Mock IPC bridge created with all expected methods

- [x] Create mock file system service
  - [x] Create `src/tests/helpers/mockFs.ts` file
    1. Implement file system operations:
       ```typescript
       export class MockFileSystemService {
         async scanDirectory(path: string): Promise<FileInfo[]> {
           // Return fixture data based on path
         }
         async getFileMetadata(path: string): Promise<FileMetadata> {
           // Return mock metadata
         }
       }
       ```
  - [x] Add fixture data loading capabilities
  - [x] Success: Mock file system service supports fixture data

- [x] Create mock database service
  - [x] Create `src/tests/helpers/testDatabase.ts` file
    1. Set up in-memory SQLite database:
       ```typescript
       import Database from 'better-sqlite3'
       
       export const createTestDatabase = async () => {
         const db = new Database(':memory:')
         await runMigrations(db)
         return db
       }
       ```
  - [x] Add database seeding utilities
  - [x] Success: In-memory database setup working

- [x] Create test builder utilities
  - [x] Create `src/tests/helpers/testBuilder.ts` file
    1. Implement builder patterns:
       ```typescript
       export const fileBuilder = () => ({
         withPath: (path: string) => this,
         withSize: (size: number) => this,
         withMimeType: (type: string) => this,
         build: (): FileInfo => ({})
       })
       ```
  - [x] Add builders for all major data types
  - [x] Success: Builder pattern utilities created

#### Set Up Test Fixtures and Sample Data
- [x] Create fixture directory structure
  - [x] Create `src/tests/fixtures/` directory
  - [x] Create subdirectories: `sample-images/`, `sample-docs/`, `sample-code/`
  - [x] Success: Fixture directory structure created

- [x] Add sample files for testing
  - [x] Add sample images
    1. Create small PNG files (100x100px)
    2. Create small JPG files (100x100px) 
    3. Include images with EXIF data for metadata testing
  - [x] Add sample documents
    1. Create sample PDF file
    2. Create sample TXT files with known content
    3. Create sample markdown files
  - [x] Add sample code files
    1. Create TypeScript files
    2. Create JavaScript files
    3. Create JSON configuration files
  - [x] Success: Sample files covering all target types created

- [x] Create test database fixtures
  - [x] Create `src/tests/fixtures/test-db.sql` file
    1. Add sample file records:
       ```sql
       INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3) 
       VALUES 
       ('/test/image.png', 'image.png', 1024, 'image/png', 1630000000, 1630000000, 'abc123'),
       ('/test/doc.pdf', 'doc.pdf', 2048, 'application/pdf', 1630000000, 1630000000, 'def456');
       ```
  - [x] Add sample scan history records
  - [x] Success: Test database fixtures created

- [x] Create fixture loading utilities
  - [x] Create `src/tests/helpers/fixtureLoader.ts` file
    1. Add fixture path resolution:
       ```typescript
       export const getFixturePath = (filename: string) => 
         path.join(__dirname, '../fixtures', filename)
       ```
  - [x] Add fixture file loading utilities
  - [x] Success: Fixture loading helpers created

### Day 2: Database Layer Implementation

#### Expand Database Service with Core Tables
- [x] Create enhanced database service class
  - [x] Create `src/main/services/DatabaseService.ts` class
    1. Expand beyond basic meta table functionality:
       ```typescript
       export class DatabaseService {
         private db: Database.Database | null = null
         
         async initialize(dbPath: string): Promise<void> {
           this.db = new Database(dbPath)
           this.db.pragma('journal_mode = WAL')
           this.db.pragma('synchronous = NORMAL')
           await this.runMigrations()
         }
         
         private async runMigrations(): Promise<void> {
           // Migration system with version tracking
         }
       }
       ```
  - [x] Add proper error handling and connection lifecycle
  - [x] Success: Enhanced DatabaseService class created

- [x] Implement migration system with version tracking
  - [x] Create migration infrastructure
    1. Add migration tracking and execution:
       ```typescript
       private async runMigrations(): Promise<void> {
         const currentVersion = this.getCurrentVersion()
         const migrations = this.getMigrations()
         
         for (const migration of migrations) {
           if (migration.version > currentVersion) {
             await this.executeMigration(migration)
             this.updateVersion(migration.version)
           }
         }
       }
       ```
  - [x] Define migration structure and versioning
  - [x] Success: Migration system implemented

- [x] Create core table schemas
  - [x] Create files table migration
    1. Add files table schema:
       ```sql
       CREATE TABLE files (
         id INTEGER PRIMARY KEY,
         path TEXT UNIQUE NOT NULL,
         name TEXT NOT NULL,
         size INTEGER,
         mime_type TEXT,
         created_at INTEGER,
         modified_at INTEGER,
         hash_xxh3 TEXT,
         hash_blake3 TEXT,
         metadata JSON
       );
       CREATE INDEX idx_files_path ON files(path);
       CREATE INDEX idx_files_mime_type ON files(mime_type);
       ```
  - [x] Create scan_history table migration
    1. Add scan_history schema:
       ```sql
       CREATE TABLE scan_history (
         id INTEGER PRIMARY KEY,
         directory TEXT NOT NULL,
         started_at INTEGER,
         completed_at INTEGER,
         files_scanned INTEGER,
         status TEXT
       );
       CREATE INDEX idx_scan_history_directory ON scan_history(directory);
       ```
  - [x] Success: Core tables created with proper indexing

#### Integrate sqlite-vec Vector Extension
- [x] Configure sqlite-vec extension loading
  - [x] Add vector extension initialization
    1. Implement extension loading with fallback:
       ```typescript
       private loadVectorExtension(): boolean {
         try {
           // Try to load sqlite-vec extension
           this.db.loadExtension('sqlite-vec')
           console.log('sqlite-vec extension loaded successfully')
           return true
         } catch (error) {
           console.warn('sqlite-vec extension not available:', error.message)
           return false
         }
       }
       ```
  - [x] Implement fallback strategy for missing extension
  - [x] Success: Vector extension loading with fallback implemented

- [x] Create vector storage tables
  - [x] Create text embeddings virtual table
    1. Add text embeddings table:
       ```sql
       CREATE VIRTUAL TABLE IF NOT EXISTS text_embeddings USING vec0(
         file_id INTEGER PRIMARY KEY,
         embedding FLOAT[384]  -- MiniLM dimension
       );
       ```
  - [x] Create image embeddings virtual table
    1. Add image embeddings table:
       ```sql
       CREATE VIRTUAL TABLE IF NOT EXISTS image_embeddings USING vec0(
         file_id INTEGER PRIMARY KEY,
         embedding FLOAT[512]  -- CLIP dimension
       );
       ```
  - [x] Success: Vector tables created successfully

- [x] Implement basic vector operations
  - [x] Add vector insertion methods
    1. Implement vector storage operations:
       ```typescript
       async addTextEmbedding(fileId: number, embedding: Float32Array): Promise<void> {
         if (!this.vectorSupport) {
           console.warn('Vector operations not supported')
           return
         }
         const stmt = this.db.prepare('INSERT INTO text_embeddings VALUES (?, ?)')
         stmt.run(fileId, Array.from(embedding))
       }
       ```
  - [x] Add vector similarity search methods
  - [x] Add vector deletion and update methods
  - [x] Success: Basic vector operations implemented

#### Implement Repository Pattern and Data Access Layer
- [x] Define repository interfaces
  - [x] Create `src/shared/types/repositories.ts` file
    1. Define FileRepository interface:
       ```typescript
       export interface FileRepository {
         findById(id: number): Promise<File | null>
         findByPath(path: string): Promise<File | null>
         search(criteria: SearchCriteria): Promise<File[]>
         insert(file: FileInfo): Promise<number>
         update(id: number, updates: Partial<File>): Promise<void>
         delete(id: number): Promise<void>
       }
       ```
  - [x] Define VectorStore interface
    1. Define VectorStore interface:
       ```typescript
       export interface VectorStore {
         addTextEmbedding(fileId: number, embedding: Float32Array): Promise<void>
         addImageEmbedding(fileId: number, embedding: Float32Array): Promise<void>
         searchSimilar(embedding: Float32Array, limit: number): Promise<SimilarityResult[]>
         removeEmbeddings(fileId: number): Promise<void>
       }
       ```
  - [x] Success: Repository interfaces defined

- [x] Implement FileRepository
  - [x] Create `src/main/repositories/FileRepository.ts` file
    1. Implement CRUD operations:
       ```typescript
       export class FileRepository implements IFileRepository {
         constructor(private db: Database.Database) {}
         
         async insert(file: FileInfo): Promise<number> {
           const stmt = this.db.prepare(`
             INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, hash_blake3, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           `)
           const result = stmt.run(
             file.path, file.name, file.size, file.mimeType,
             file.createdAt, file.modifiedAt, file.hashXxh3, file.hashBlake3,
             JSON.stringify(file.metadata)
           )
           return result.lastInsertRowid as number
         }
         
         async findByPath(path: string): Promise<File | null> {
           const stmt = this.db.prepare('SELECT * FROM files WHERE path = ?')
           const row = stmt.get(path) as any
           return row ? this.mapRowToFile(row) : null
         }
       }
       ```
  - [x] Add search and query methods with filtering
  - [x] Add batch operations for performance
  - [x] Success: FileRepository fully implemented

- [x] Implement VectorStore
  - [x] Create `src/main/repositories/VectorStore.ts` file
    1. Implement vector storage operations:
       ```typescript
       export class VectorStore implements IVectorStore {
         constructor(private db: Database.Database, private vectorSupport: boolean) {}
         
         async addTextEmbedding(fileId: number, embedding: Float32Array): Promise<void> {
           if (!this.vectorSupport) return
           
           const stmt = this.db.prepare('INSERT OR REPLACE INTO text_embeddings VALUES (?, ?)')
           stmt.run(fileId, Array.from(embedding))
         }
         
         async searchSimilar(embedding: Float32Array, limit: number = 10): Promise<SimilarityResult[]> {
           if (!this.vectorSupport) return []
           
           // Implement similarity search using sqlite-vec
         }
       }
       ```
  - [x] Implement similarity search algorithms
  - [x] Add embedding management (update, delete)
  - [x] Success: VectorStore implementation complete

- [x] Create ScanHistoryRepository
  - [x] Create `src/main/repositories/ScanHistoryRepository.ts` file
    1. Implement CRUD operations for scan tracking:
       ```typescript
       export class ScanHistoryRepository implements IScanHistoryRepository {
         constructor(private db: Database.Database) {}
         
         async create(directory: string): Promise<number> {
           const stmt = this.db.prepare(`
             INSERT INTO scan_history (directory, started_at, files_scanned, status)
             VALUES (?, ?, 0, 'running')
           `)
           const result = stmt.run(directory, Date.now())
           return result.lastInsertRowid as number
         }
       }
       ```
  - [x] Success: ScanHistoryRepository implemented

- [x] Create RepositoryService for centralized management
  - [x] Create `src/main/services/RepositoryService.ts` file
    1. Implement repository factory and convenience methods:
       ```typescript
       export class RepositoryService {
         constructor(db: Database, vectorSupport: boolean) {
           this.fileRepository = new FileRepository(db)
           this.vectorStore = new VectorStore(db, vectorSupport)
           this.scanHistoryRepository = new ScanHistoryRepository(db)
         }
       }
       ```
  - [x] Success: RepositoryService created

- [x] Add transaction support
  - [x] Implement transaction wrapper utility
    1. Add transaction support:
       ```typescript
       async withTransaction<T>(operation: (db: Database.Database) => Promise<T>): Promise<T> {
         const transaction = this.db.transaction((op) => op())
         try {
           return await transaction(operation)
         } catch (error) {
           // Transaction automatically rolls back on error
           throw error
         }
       }
       ```
  - [x] Update repository methods to support transactions
  - [x] Add batch processing with transactions
  - [x] Success: Transaction support implemented

### Day 3: IPC Architecture Implementation

#### Define IPC Protocol Contracts
- [ ] Create comprehensive IPC type definitions
  - [ ] Create `src/shared/types/ipc.ts` with all API interfaces
    1. Define main IPC API interface:
       ```typescript
       export interface IpcApi {
         // File System Operations
         selectDirectory(): Promise<string | null>
         scanDirectory(path: string): Promise<ScanResult>
         cancelScan(): Promise<void>
         
         // Database Operations
         searchFiles(criteria: SearchCriteria): Promise<File[]>
         getFileMetadata(fileId: number): Promise<FileMetadata>
         getScanHistory(): Promise<ScanHistory[]>
         
         // Vector Search Operations
         searchSimilarImages(embedding: Float32Array, limit?: number): Promise<SimilarityResult[]>
         searchSimilarText(embedding: Float32Array, limit?: number): Promise<SimilarityResult[]>
         
         // Application Operations
         getAppVersion(): Promise<string>
         minimizeWindow(): Promise<void>
         maximizeWindow(): Promise<void>
         closeWindow(): Promise<void>
       }
       ```
  - [ ] Define event interfaces for bidirectional communication
    1. Create event type definitions:
       ```typescript
       export interface IpcEvents {
         // Scan Progress Events
         'scan:started': (data: { directory: string, scanId: number }) => void
         'scan:progress': (data: { scanId: number, current: number, total: number, currentFile: string }) => void
         'scan:completed': (data: { scanId: number, filesFound: number, duration: number }) => void
         'scan:cancelled': (data: { scanId: number }) => void
         'scan:error': (data: { scanId: number, error: string }) => void
         
         // Application Events
         'app:error': (data: { error: string, details?: any }) => void
         'app:status': (data: { status: 'ready' | 'busy' | 'error' }) => void
       }
       ```
  - [ ] Create request/response type definitions
    1. Define request and response types:
       ```typescript
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
       
       export interface SearchCriteria {
         mimeTypes?: string[]
         sizeMin?: number
         sizeMax?: number
         dateRange?: { start: number, end: number }
         textQuery?: string
         limit?: number
         offset?: number
       }
       ```
  - [ ] Success: IPC API interfaces defined with full TypeScript support

- [ ] Document channel naming conventions and security boundaries
  - [ ] Create `src/shared/constants/ipc-channels.ts` with standardized channel names
    1. Define channel constants:
       ```typescript
       export const IPC_CHANNELS = {
         // File System Channels
         SELECT_DIRECTORY: 'fs:select-directory',
         SCAN_DIRECTORY: 'fs:scan-directory',
         CANCEL_SCAN: 'fs:cancel-scan',
         
         // Database Channels
         SEARCH_FILES: 'db:search-files',
         GET_FILE_METADATA: 'db:get-file-metadata',
         GET_SCAN_HISTORY: 'db:get-scan-history',
         
         // Vector Search Channels
         SEARCH_SIMILAR_IMAGES: 'vector:search-images',
         SEARCH_SIMILAR_TEXT: 'vector:search-text',
         
         // Application Channels
         GET_APP_VERSION: 'app:get-version',
         MINIMIZE_WINDOW: 'app:minimize',
         MAXIMIZE_WINDOW: 'app:maximize',
         CLOSE_WINDOW: 'app:close'
       } as const
       ```
  - [ ] Add security documentation for each channel
  - [ ] Success: Channel naming conventions standardized and documented

- [ ] Create TypeScript declaration file for renderer process
  - [ ] Create `src/renderer/types/electron.d.ts` file
    1. Add global type declarations:
       ```typescript
       import { IpcApi, IpcEvents } from '../shared/types/ipc'
       
       declare global {
         interface Window {
           electronAPI: IpcApi & {
             // Event listener methods
             onScanProgress(callback: IpcEvents['scan:progress']): void
             onScanCompleted(callback: IpcEvents['scan:completed']): void
             onScanCancelled(callback: IpcEvents['scan:cancelled']): void
             onScanError(callback: IpcEvents['scan:error']): void
             onAppError(callback: IpcEvents['app:error']): void
             onAppStatus(callback: IpcEvents['app:status']): void
             
             // Event cleanup methods
             removeAllListeners(channel: keyof IpcEvents): void
           }
         }
       }
       
       export {}
       ```
  - [ ] Ensure strict typing prevents runtime errors
  - [ ] Success: Type safety enforced across main/renderer boundary

#### Implement Secure Context Bridge
- [ ] Create secure preload script with context isolation
  - [ ] Create `src/preload/index.ts` with contextBridge setup
    1. Implement secure IPC bridge:
       ```typescript
       import { contextBridge, ipcRenderer } from 'electron'
       import { IPC_CHANNELS } from '../shared/constants/ipc-channels'
       import type { IpcApi, ScanDirectoryRequest, SearchCriteria } from '../shared/types/ipc'
       
       // Define the API that will be exposed to the renderer process
       const electronAPI: IpcApi = {
         // File System Operations
         selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY),
         scanDirectory: (path: string) => {
           if (typeof path !== 'string' || !path.trim()) {
             throw new Error('Invalid directory path provided')
           }
           return ipcRenderer.invoke(IPC_CHANNELS.SCAN_DIRECTORY, { path })
         },
         cancelScan: () => ipcRenderer.invoke(IPC_CHANNELS.CANCEL_SCAN),
         
         // Database Operations
         searchFiles: (criteria: SearchCriteria) => {
           // Input validation
           if (typeof criteria !== 'object' || criteria === null) {
             throw new Error('Invalid search criteria provided')
           }
           return ipcRenderer.invoke(IPC_CHANNELS.SEARCH_FILES, criteria)
         },
         
         // Continue with all other methods...
       }
       ```
  - [ ] Add input validation for all exposed methods
    1. Implement comprehensive input validation:
       ```typescript
       const validateSearchCriteria = (criteria: any): SearchCriteria => {
         if (typeof criteria !== 'object' || criteria === null) {
           throw new Error('Search criteria must be an object')
         }
         
         const validated: SearchCriteria = {}
         
         if (criteria.mimeTypes !== undefined) {
           if (!Array.isArray(criteria.mimeTypes)) {
             throw new Error('mimeTypes must be an array')
           }
           validated.mimeTypes = criteria.mimeTypes.filter(type => typeof type === 'string')
         }
         
         if (criteria.sizeMin !== undefined) {
           if (typeof criteria.sizeMin !== 'number' || criteria.sizeMin < 0) {
             throw new Error('sizeMin must be a positive number')
           }
           validated.sizeMin = criteria.sizeMin
         }
         
         // Continue validation for all fields...
         return validated
       }
       ```
  - [ ] Success: Preload script created with proper context isolation

- [ ] Implement safe event listener system
  - [ ] Add secure event listener methods to preload script
    1. Implement event listener management:
       ```typescript
       const eventAPI = {
         // Progress event listeners
         onScanProgress: (callback: (data: any) => void) => {
           ipcRenderer.on('scan:progress', (_, data) => {
             if (typeof callback === 'function') {
               callback(data)
             }
           })
         },
         
         onScanCompleted: (callback: (data: any) => void) => {
           ipcRenderer.on('scan:completed', (_, data) => {
             if (typeof callback === 'function') {
               callback(data)
             }
           })
         },
         
         // Cleanup method
         removeAllListeners: (channel: string) => {
           if (typeof channel === 'string') {
             ipcRenderer.removeAllListeners(channel)
           }
         }
       }
       
       // Expose to renderer with validation
       contextBridge.exposeInMainWorld('electronAPI', {
         ...electronAPI,
         ...eventAPI
       })
       ```
  - [ ] Add proper cleanup for event listeners
  - [ ] Success: Event system prevents memory leaks and provides secure communication

- [ ] Configure preload script in main process window creation
  - [ ] Update main window creation to use preload script
    1. Configure BrowserWindow with preload:
       ```typescript
       // In main process window creation
       const mainWindow = new BrowserWindow({
         width: 1200,
         height: 800,
         webPreferences: {
           nodeIntegration: false,
           contextIsolation: true,
           preload: path.join(__dirname, '../preload/index.js'),
           sandbox: false // Required for better-sqlite3 integration
         }
       })
       ```
  - [ ] Verify security settings prevent direct Node.js access
  - [ ] Success: Security audit passes - no direct IPC access from renderer

- [ ] Write security validation tests
  - [ ] Create `src/tests/security/preload-security.test.ts`
    1. Test context isolation:
       ```typescript
       describe('Preload Security', () => {
         test('should not expose Node.js globals to renderer', async () => {
           // Mock renderer environment
           const rendererGlobals = Object.keys(global)
           const dangerousGlobals = ['process', 'Buffer', 'global', '__dirname', '__filename']
           
           dangerousGlobals.forEach(dangerousGlobal => {
             expect(rendererGlobals).not.toContain(dangerousGlobal)
           })
         })
         
         test('should validate all IPC method inputs', async () => {
           // Test input validation for each exposed method
           expect(() => electronAPI.scanDirectory('')).toThrow('Invalid directory path')
           expect(() => electronAPI.searchFiles(null)).toThrow('Invalid search criteria')
         })
       })
       ```
  - [ ] Test that sensitive APIs are not exposed
  - [ ] Success: Security tests pass and verify proper isolation

#### Create IPC Service Handlers in Main Process
- [ ] Create centralized IPC service class
  - [ ] Create `src/main/services/IpcService.ts` file
    1. Implement IPC service structure:
       ```typescript
       import { ipcMain, dialog, BrowserWindow } from 'electron'
       import { IPC_CHANNELS } from '../../shared/constants/ipc-channels'
       import { DatabaseService } from './DatabaseService'
       import { FileSystemService } from './FileSystemService'
       import { RepositoryService } from './RepositoryService'
       
       export class IpcService {
         private currentScans = new Map<number, AbortController>()
         private scanIdCounter = 0
         
         constructor(
           private databaseService: DatabaseService,
           private fileSystemService: FileSystemService,
           private repositoryService: RepositoryService,
           private mainWindow: BrowserWindow
         ) {
           this.registerHandlers()
         }
         
         private registerHandlers(): void {
           // File system handlers
           ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, this.handleSelectDirectory.bind(this))
           ipcMain.handle(IPC_CHANNELS.SCAN_DIRECTORY, this.handleScanDirectory.bind(this))
           ipcMain.handle(IPC_CHANNELS.CANCEL_SCAN, this.handleCancelScan.bind(this))
           
           // Database handlers
           ipcMain.handle(IPC_CHANNELS.SEARCH_FILES, this.handleSearchFiles.bind(this))
           ipcMain.handle(IPC_CHANNELS.GET_FILE_METADATA, this.handleGetFileMetadata.bind(this))
           ipcMain.handle(IPC_CHANNELS.GET_SCAN_HISTORY, this.handleGetScanHistory.bind(this))
           
           // Vector search handlers
           ipcMain.handle(IPC_CHANNELS.SEARCH_SIMILAR_IMAGES, this.handleSearchSimilarImages.bind(this))
           ipcMain.handle(IPC_CHANNELS.SEARCH_SIMILAR_TEXT, this.handleSearchSimilarText.bind(this))
           
           // Application handlers
           ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, this.handleGetAppVersion.bind(this))
           ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, this.handleMinimizeWindow.bind(this))
           ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, this.handleMaximizeWindow.bind(this))
           ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, this.handleCloseWindow.bind(this))
         }
       }
       ```
  - [ ] Add proper error handling and logging
  - [ ] Success: IPC service class structure created

- [ ] Implement file system operation handlers
  - [ ] Add directory selection handler
    1. Implement directory selection:
       ```typescript
       private async handleSelectDirectory(): Promise<string | null> {
         try {
           const result = await dialog.showOpenDialog(this.mainWindow, {
             properties: ['openDirectory'],
             title: 'Select Directory to Scan'
           })
           
           if (result.canceled || !result.filePaths.length) {
             return null
           }
           
           return result.filePaths[0]
         } catch (error) {
           console.error('Error selecting directory:', error)
           throw new Error('Failed to open directory selector')
         }
       }
       ```
  - [ ] Add directory scanning handler with progress events
    1. Implement directory scanning with progress:
       ```typescript
       private async handleScanDirectory(event: Electron.IpcMainInvokeEvent, request: ScanDirectoryRequest): Promise<ScanResult> {
         const scanId = ++this.scanIdCounter
         const abortController = new AbortController()
         this.currentScans.set(scanId, abortController)
         
         try {
           // Emit scan started event
           this.mainWindow.webContents.send('scan:started', {
             directory: request.path,
             scanId
           })
           
           const startTime = Date.now()
           let filesProcessed = 0
           
           // Start scan with progress callback
           const files = await this.fileSystemService.scanDirectory(
             request.path,
             (current, total, currentFile) => {
               if (abortController.signal.aborted) {
                 throw new Error('Scan cancelled')
               }
               
               // Emit progress event (throttled to avoid UI flooding)
               if (current % 10 === 0 || current === total) {
                 this.mainWindow.webContents.send('scan:progress', {
                   scanId,
                   current,
                   total,
                   currentFile
                 })
               }
               filesProcessed = current
             },
             abortController.signal
           )
           
           // Store files in database
           const fileIds = await this.repositoryService.getFileRepository().batchInsert(files)
           
           const duration = Date.now() - startTime
           
           // Emit completion event
           this.mainWindow.webContents.send('scan:completed', {
             scanId,
             filesFound: files.length,
             duration
           })
           
           return {
             success: true,
             scanId,
             filesFound: files.length,
             duration
           }
           
         } catch (error) {
           console.error('Scan error:', error)
           
           if (error.message.includes('cancelled')) {
             this.mainWindow.webContents.send('scan:cancelled', { scanId })
             return { success: false, scanId, filesFound: 0, duration: 0, error: 'Scan cancelled' }
           } else {
             this.mainWindow.webContents.send('scan:error', {
               scanId,
               error: error.message
             })
             throw error
           }
         } finally {
           this.currentScans.delete(scanId)
         }
       }
       ```
  - [ ] Add scan cancellation handler
    1. Implement scan cancellation:
       ```typescript
       private async handleCancelScan(): Promise<void> {
         // Cancel all active scans
         for (const [scanId, controller] of this.currentScans) {
           controller.abort()
           this.mainWindow.webContents.send('scan:cancelled', { scanId })
         }
         this.currentScans.clear()
       }
       ```
  - [ ] Success: File system handlers implemented with proper progress events

- [ ] Implement database operation handlers
  - [ ] Add file search handler
    1. Implement file search with validation:
       ```typescript
       private async handleSearchFiles(event: Electron.IpcMainInvokeEvent, criteria: SearchCriteria): Promise<File[]> {
         try {
           // Validate search criteria
           if (typeof criteria !== 'object' || criteria === null) {
             throw new Error('Invalid search criteria')
           }
           
           // Apply search with repository
           const files = await this.repositoryService.getFileRepository().search(criteria)
           
           return files
         } catch (error) {
           console.error('Search error:', error)
           throw new Error(`Search failed: ${error.message}`)
         }
       }
       ```
  - [ ] Add file metadata retrieval handler
    1. Implement metadata retrieval:
       ```typescript
       private async handleGetFileMetadata(event: Electron.IpcMainInvokeEvent, fileId: number): Promise<FileMetadata | null> {
         try {
           if (typeof fileId !== 'number' || fileId <= 0) {
             throw new Error('Invalid file ID provided')
           }
           
           const file = await this.repositoryService.getFileRepository().findById(fileId)
           
           if (!file) {
             return null
           }
           
           // Extract detailed metadata if needed
           const metadata = await this.fileSystemService.getDetailedMetadata(file.path)
           
           return {
             ...file,
             detailedMetadata: metadata
           }
         } catch (error) {
           console.error('Metadata retrieval error:', error)
           throw new Error(`Failed to get file metadata: ${error.message}`)
         }
       }
       ```
  - [ ] Add scan history handler
  - [ ] Success: Database handlers implemented with proper validation

- [ ] Implement vector search handlers
  - [ ] Add image similarity search handler
    1. Implement image similarity search:
       ```typescript
       private async handleSearchSimilarImages(event: Electron.IpcMainInvokeEvent, embedding: Float32Array, limit: number = 10): Promise<SimilarityResult[]> {
         try {
           if (!(embedding instanceof Float32Array)) {
             throw new Error('Invalid embedding format - must be Float32Array')
           }
           
           if (embedding.length !== 512) {
             throw new Error('Invalid image embedding dimension - expected 512')
           }
           
           const results = await this.repositoryService.getVectorStore().searchSimilarImages(embedding, limit)
           
           // Enrich results with file information
           const enrichedResults = await Promise.all(
             results.map(async (result) => {
               const file = await this.repositoryService.getFileRepository().findById(result.fileId)
               return {
                 ...result,
                 file
               }
             })
           )
           
           return enrichedResults
         } catch (error) {
           console.error('Image similarity search error:', error)
           throw new Error(`Image similarity search failed: ${error.message}`)
         }
       }
       ```
  - [ ] Add text similarity search handler
  - [ ] Success: Vector search handlers implemented

- [ ] Implement application control handlers
  - [ ] Add window control handlers
    1. Implement window controls:
       ```typescript
       private async handleMinimizeWindow(): Promise<void> {
         this.mainWindow.minimize()
       }
       
       private async handleMaximizeWindow(): Promise<void> {
         if (this.mainWindow.isMaximized()) {
           this.mainWindow.unmaximize()
         } else {
           this.mainWindow.maximize()
         }
       }
       
       private async handleCloseWindow(): Promise<void> {
         this.mainWindow.close()
       }
       
       private async handleGetAppVersion(): Promise<string> {
         return process.env.npm_package_version || '0.0.0'
       }
       ```
  - [ ] Add application info handlers
  - [ ] Success: Application control handlers working

- [ ] Write comprehensive IPC integration tests
  - [ ] Create `src/tests/integration/ipc-flow.test.ts`
    1. Test complete IPC communication flow:
       ```typescript
       describe('IPC Integration', () => {
         let ipcService: IpcService
         let mockWindow: BrowserWindow
         
         beforeEach(async () => {
           mockWindow = new BrowserWindow({ show: false })
           ipcService = new IpcService(
             mockDatabaseService,
             mockFileSystemService,
             mockRepositoryService,
             mockWindow
           )
         })
         
         test('should handle directory selection', async () => {
           const result = await ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY)
           expect(typeof result === 'string' || result === null).toBe(true)
         })
         
         test('should handle directory scan with progress events', async () => {
           const progressEvents: any[] = []
           
           ipcRenderer.on('scan:progress', (_, data) => {
             progressEvents.push(data)
           })
           
           const scanResult = await ipcRenderer.invoke(IPC_CHANNELS.SCAN_DIRECTORY, {
             path: '/test/directory'
           })
           
           expect(scanResult.success).toBe(true)
           expect(progressEvents.length).toBeGreaterThan(0)
         })
         
         test('should handle file search operations', async () => {
           const criteria = { mimeTypes: ['image/jpeg'], limit: 10 }
           const results = await ipcRenderer.invoke(IPC_CHANNELS.SEARCH_FILES, criteria)
           
           expect(Array.isArray(results)).toBe(true)
         })
       })
       ```
  - [ ] Test error scenarios and edge cases
  - [ ] Test security boundaries and input validation
  - [ ] Success: IPC integration tests pass with comprehensive coverage

### Day 4: File System Service Implementation

#### Create Directory Scanning Service
- [ ] Install file system dependencies
  - [ ] Install required packages for file operations
    1. Run:
       ```bash
       npm install mime-types @types/mime-types
       npm install exifr  # For EXIF data extraction
       npm install xxhash-wasm blake3-wasm  # For hashing
       ```
  - [ ] Verify all packages installed successfully
  - [ ] Success: File system dependencies installed

- [ ] Create file system service class
  - [ ] Create `src/main/services/FileSystemService.ts` file
    1. Implement basic service structure:
       ```typescript
       import * as fs from 'fs/promises'
       import * as path from 'path'
       
       export class FileSystemService {
         async scanDirectory(dirPath: string): Promise<FileInfo[]> {
           const files: FileInfo[] = []
           await this.walkDirectory(dirPath, files)
           return files
         }
         
         private async *walkDirectory(dirPath: string): AsyncGenerator<string> {
           // Implement recursive directory walking
         }
       }
       ```
  - [ ] Add error handling for file system operations
  - [ ] Success: FileSystemService class created

- [ ] Implement recursive directory traversal
  - [ ] Add async generator for directory walking
    1. Implement recursive traversal:
       ```typescript
       private async *walkDirectory(dirPath: string): AsyncGenerator<string> {
         try {
           const entries = await fs.readdir(dirPath, { withFileTypes: true })
           
           for (const entry of entries) {
             const fullPath = path.join(dirPath, entry.name)
             
             if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
               yield* this.walkDirectory(fullPath)
             } else if (entry.isFile() && !this.shouldSkipFile(entry.name)) {
               yield fullPath
             }
           }
         } catch (error) {
           console.warn(`Cannot read directory ${dirPath}:`, error.message)
         }
       }
       ```
  - [ ] Add file filtering logic
  - [ ] Success: Recursive directory traversal implemented

- [ ] Implement file filtering and exclusion rules
  - [ ] Add directory skip logic
    1. Implement skip rules:
       ```typescript
       private shouldSkipDirectory(name: string): boolean {
         const skipPatterns = [
           '.git', '.svn', '.hg',  // Version control
           'node_modules', '.npm', // Package managers
           '.DS_Store', 'Thumbs.db', // System files
           '__pycache__', '.pytest_cache' // Python cache
         ]
         return skipPatterns.some(pattern => name.includes(pattern))
       }
       ```
  - [ ] Add file skip logic
    1. Implement file skip rules:
       ```typescript
       private shouldSkipFile(name: string): boolean {
         return name.startsWith('.') || name.startsWith('~')
       }
       ```
  - [ ] Success: File filtering and exclusion rules working

- [ ] Add progress reporting during scan
  - [ ] Implement progress callback system
    1. Add progress reporting:
       ```typescript
       async scanDirectory(
         dirPath: string, 
         onProgress?: (current: number, total: number, file: string) => void
       ): Promise<FileInfo[]> {
         const files: string[] = []
         
         // First pass: collect all file paths
         for await (const filePath of this.walkDirectory(dirPath)) {
           files.push(filePath)
         }
         
         // Second pass: process with progress reporting
         const results: FileInfo[] = []
         for (let i = 0; i < files.length; i++) {
           onProgress?.(i + 1, files.length, files[i])
           const info = await this.getFileInfo(files[i])
           results.push(info)
         }
         
         return results
       }
       ```
  - [ ] Implement batch progress updates to avoid UI flooding
  - [ ] Success: Progress reporting during scan implemented

#### Extract Comprehensive File Metadata
- [ ] Implement basic file metadata extraction
  - [ ] Add file stats extraction
    1. Implement basic metadata:
       ```typescript
       private async getFileInfo(filePath: string): Promise<FileInfo> {
         try {
           const stats = await fs.stat(filePath)
           const mimeType = mime.lookup(filePath) || 'application/octet-stream'
           
           return {
             path: filePath,
             name: path.basename(filePath),
             size: stats.size,
             mimeType,
             createdAt: stats.birthtime.getTime(),
             modifiedAt: stats.mtime.getTime(),
             metadata: {}
           }
         } catch (error) {
           console.warn(`Cannot read file ${filePath}:`, error.message)
           return null
         }
       }
       ```
  - [ ] Add MIME type detection
  - [ ] Success: Basic file metadata extraction working

- [ ] Implement specialized metadata extraction
  - [ ] Add image metadata extraction
    1. Extract EXIF data from images:
       ```typescript
       private async extractImageMetadata(filePath: string): Promise<any> {
         try {
           if (this.isImageFile(filePath)) {
             const exifr = await import('exifr')
             const data = await exifr.parse(filePath)
             return {
               width: data?.ImageWidth,
               height: data?.ImageHeight,
               camera: data?.Make,
               model: data?.Model,
               dateTime: data?.DateTime
             }
           }
         } catch (error) {
           console.warn(`Cannot extract image metadata for ${filePath}:`, error.message)
         }
         return {}
       }
       ```
  - [ ] Add document metadata extraction (when possible)
  - [ ] Add audio/video metadata extraction (when possible)
  - [ ] Success: Specialized metadata extraction implemented

- [ ] Handle metadata extraction errors gracefully
  - [ ] Add try-catch blocks around all metadata operations
  - [ ] Log warnings but don't fail the scan
  - [ ] Return partial metadata when some extraction fails
  - [ ] Success: Metadata extraction errors handled gracefully

#### Implement File Hash Calculation
- [ ] Set up hash calculation libraries
  - [ ] Configure xxHash3 implementation
    1. Set up xxHash3:
       ```typescript
       import { xxHash3 } from 'xxhash-wasm'
       
       export class HashCalculator {
         private xxHash3: any
         
         async initialize(): Promise<void> {
           this.xxHash3 = await xxHash3()
         }
         
         calculateXXHash3(data: Buffer): string {
           return this.xxHash3.hash(data).toString(16)
         }
       }
       ```
  - [ ] Configure BLAKE3 implementation
  - [ ] Success: Hash calculation libraries configured

- [ ] Implement streaming hash calculation for large files
  - [ ] Add streaming hash calculation
    1. Implement streaming for large files:
       ```typescript
       private async calculateFileHash(filePath: string): Promise<FileHash> {
         const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }) // 64KB chunks
         const xxHasher = this.xxHash3.create()
         const blake3Hasher = this.blake3.create()
         
         for await (const chunk of stream) {
           xxHasher.update(chunk)
           blake3Hasher.update(chunk)
         }
         
         return {
           xxh3: xxHasher.digest('hex'),
           blake3: blake3Hasher.digest('hex')
         }
       }
       ```
  - [ ] Add memory-efficient processing for large files
  - [ ] Success: Streaming hash calculation implemented

- [ ] Add batch processing to avoid blocking
  - [ ] Implement hash calculation queue
    1. Add batch processing:
       ```typescript
       private async processHashBatch(files: string[], batchSize: number = 10): Promise<void> {
         for (let i = 0; i < files.length; i += batchSize) {
           const batch = files.slice(i, i + batchSize)
           await Promise.all(batch.map(file => this.calculateFileHash(file)))
           
           // Allow event loop to process other tasks
           await new Promise(resolve => setImmediate(resolve))
         }
       }
       ```
  - [ ] Add configurable batch sizes
  - [ ] Success: Batch processing implemented

- [ ] Write hash verification and performance tests
  - [ ] Create hash verification tests with known files
  - [ ] Benchmark hash calculation performance
  - [ ] Test with various file sizes
  - [ ] Success: Hash verification tests pass

### Day 5: Minimal UI Shell Implementation

#### Create React UI Infrastructure
- [x] Install React and UI dependencies
  - [x] Install React and related packages
    1. Run:
       ```bash
       npm install react react-dom @types/react @types/react-dom
       npm install @radix-ui/react-dialog @radix-ui/react-progress @radix-ui/react-button
       npm install @testing-library/react @testing-library/jest-dom
       ```
  - [x] Verify all packages installed successfully
  - [x] Success: React UI dependencies installed

- [x] Set up React application structure
  - [x] Create `src/renderer/index.tsx` entry point
    1. Set up React root:
       ```typescript
       import React from 'react'
       import { createRoot } from 'react-dom/client'
       import { App } from './components/App'
       
       const container = document.getElementById('root')!
       const root = createRoot(container)
       root.render(<App />)
       ```
  - [x] Create basic HTML template
  - [x] Success: React application structure created

#### Build Application Shell Components
- [x] Create main App component
  - [x] Create `src/renderer/App.tsx` file (exists with basic structure and IPC testing)
    1. Implement main App structure:
       ```typescript
       import React from 'react'
       import { AppShell } from './layout/AppShell'
       import { DirectoryPicker } from './features/DirectoryPicker'
       
       export const App: React.FC = () => {
         return (
           <AppShell>
             <DirectoryPicker />
           </AppShell>
         )
       }
       ```
  - [ ] Add global state management (React Context)
  - [x] Success: Main App component created

- [ ] Create AppShell layout component
  - [ ] Create `src/renderer/components/layout/AppShell.tsx` file
    1. Implement app shell structure:
       ```typescript
       import React from 'react'
       
       interface AppShellProps {
         children: React.ReactNode
       }
       
       export const AppShell: React.FC<AppShellProps> = ({ children }) => {
         return (
           <div className="app-shell">
             <header className="title-bar">
               <h1>Rummage</h1>
               <div className="window-controls">
                 {/* Window control buttons */}
               </div>
             </header>
             <main className="main-content">
               {children}
             </main>
             <footer className="status-bar">
               Status: Ready
             </footer>
           </div>
         )
       }
       ```
  - [ ] Add CSS modules for styling
  - [ ] Success: AppShell component renders properly

- [ ] Integrate window controls
  - [ ] Add window control functionality
    1. Implement window controls:
       ```typescript
       const WindowControls: React.FC = () => {
         const handleMinimize = () => window.electronAPI?.minimizeWindow?.()
         const handleMaximize = () => window.electronAPI?.maximizeWindow?.()
         const handleClose = () => window.electronAPI?.closeWindow?.()
         
         return (
           <div className="window-controls">
             <button onClick={handleMinimize}>−</button>
             <button onClick={handleMaximize}>□</button>
             <button onClick={handleClose}>×</button>
           </div>
         )
       }
       ```
  - [ ] Add IPC methods for window operations
  - [ ] Success: Window controls integration working

- [ ] Add responsive layout
  - [ ] Implement responsive CSS
    1. Add responsive styles:
       ```css
       .app-shell {
         display: grid;
         grid-template-rows: auto 1fr auto;
         height: 100vh;
         min-width: 800px;
       }
       
       @media (max-width: 1024px) {
         .main-content {
           padding: 8px;
         }
       }
       ```
  - [ ] Test with different window sizes
  - [ ] Success: Responsive layout handles different window sizes

#### Implement Directory Selection Interface
- [ ] Create directory picker component
  - [ ] Create `src/renderer/components/features/DirectoryPicker.tsx` file
    1. Implement directory picker:
       ```typescript
       import React, { useState } from 'react'
       import { Button } from '@radix-ui/react-button'
       
       export const DirectoryPicker: React.FC = () => {
         const [selectedPath, setSelectedPath] = useState<string>('')
         const [recentPaths, setRecentPaths] = useState<string[]>([])
         
         const handleSelectDirectory = async () => {
           try {
             const path = await window.electronAPI.selectDirectory()
             if (path) {
               setSelectedPath(path)
               updateRecentPaths(path)
             }
           } catch (error) {
             console.error('Failed to select directory:', error)
           }
         }
         
         return (
           <div className="directory-picker">
             <Button onClick={handleSelectDirectory}>
               Select Directory to Scan
             </Button>
             {selectedPath && (
               <div className="selected-path">
                 Selected: {selectedPath}
               </div>
             )}
           </div>
         )
       }
       ```
  - [ ] Add directory validation
  - [ ] Success: Directory picker opens native file dialog

- [ ] Implement recent directories feature
  - [ ] Add local storage for recent directories
    1. Implement recent directories storage:
       ```typescript
       const updateRecentPaths = (newPath: string) => {
         const recent = JSON.parse(localStorage.getItem('recentDirectories') || '[]')
         const updated = [newPath, ...recent.filter(p => p !== newPath)].slice(0, 5)
         localStorage.setItem('recentDirectories', JSON.stringify(updated))
         setRecentPaths(updated)
       }
       ```
  - [ ] Display recent directories list
  - [ ] Success: Recent directories list maintained

- [ ] Add directory validation and error handling
  - [ ] Validate directory exists and is accessible
  - [ ] Show error messages for invalid selections
  - [ ] Success: Directory validation and error handling implemented

#### Create Progress Display System
- [ ] Create scan progress component
  - [ ] Create `src/renderer/components/features/ScanProgress.tsx` file
    1. Implement progress display:
       ```typescript
       import React from 'react'
       import { Progress } from '@radix-ui/react-progress'
       
       interface ScanProgressProps {
         current: number
         total: number
         currentFile: string
         onCancel: () => void
       }
       
       export const ScanProgress: React.FC<ScanProgressProps> = ({
         current, total, currentFile, onCancel
       }) => {
         const percentage = total > 0 ? (current / total) * 100 : 0
         
         return (
           <div className="scan-progress">
             <h3>Scanning Directory</h3>
             <Progress value={percentage} max={100} />
             <div className="progress-stats">
               Progress: {current}/{total} ({percentage.toFixed(0)}%)
             </div>
             <div className="current-file">
               Current: {currentFile}
             </div>
             <Button onClick={onCancel}>Cancel</Button>
           </div>
         )
       }
       ```
  - [ ] Add file name truncation for long paths
  - [ ] Success: Progress bar shows scan completion percentage

- [ ] Integrate with IPC progress events
  - [ ] Set up progress event listeners
    1. Implement progress event integration:
       ```typescript
       useEffect(() => {
         const handleProgress = (progress: ScanProgress) => {
           setCurrentProgress(progress)
         }
         
         window.electronAPI.onScanProgress(handleProgress)
         
         return () => {
           window.electronAPI.removeAllListeners('scan:progress')
         }
       }, [])
       ```
  - [ ] Update UI in real-time during scans
  - [ ] Success: Scan statistics updated in real-time

- [ ] Implement cancel functionality
  - [ ] Add cancel button with confirmation
    1. Implement scan cancellation:
       ```typescript
       const handleCancel = async () => {
         const confirmed = window.confirm('Are you sure you want to cancel the scan?')
         if (confirmed) {
           await window.electronAPI.cancelScan()
         }
       }
       ```
  - [ ] Handle cleanup when scan is cancelled
  - [ ] Success: Cancel functionality implemented

- [ ] Write component tests
  - [ ] Create tests for all UI components
  - [ ] Test IPC integration with mocks
  - [ ] Test responsive behavior
  - [ ] Success: UI components fully tested

### Day 6-7: Integration and Testing

#### Create Comprehensive Integration Tests
- [ ] Set up integration test environment
  - [ ] Create integration test configuration
    1. Add integration test setup:
       ```typescript
       // src/tests/integration/setup.ts
       import { app, BrowserWindow } from 'electron'
       import { DatabaseService } from '../../main/services/DatabaseService'
       import { FileSystemService } from '../../main/services/FileSystemService'
       
       export class IntegrationTestHarness {
         private db: DatabaseService
         private fs: FileSystemService
         private window: BrowserWindow
         
         async initialize(): Promise<void> {
           await app.whenReady()
           this.window = new BrowserWindow({ show: false })
           this.db = new DatabaseService()
           this.fs = new FileSystemService()
         }
       }
       ```
  - [ ] Create test data fixtures for integration testing
  - [ ] Success: Integration test environment ready

- [ ] Test complete directory scan workflow
  - [ ] Create `src/tests/integration/foundation.test.ts` file
    1. Implement end-to-end scan test:
       ```typescript
       describe('Directory Scan Workflow', () => {
         test('should scan directory and persist to database', async () => {
           const testDir = path.join(__dirname, '../fixtures/sample-files')
           
           // Start scan operation
           const result = await testHarness.scanDirectory(testDir)
           
           // Verify scan completed
           expect(result.success).toBe(true)
           expect(result.filesFound).toBeGreaterThan(0)
           
           // Verify database persistence
           const files = await testHarness.db.getAllFiles()
           expect(files).toHaveLength(result.filesFound)
           
           // Verify file metadata is complete
           files.forEach(file => {
             expect(file.path).toBeDefined()
             expect(file.name).toBeDefined()
             expect(file.size).toBeGreaterThan(0)
             expect(file.mimeType).toBeDefined()
           })
         })
       })
       ```
  - [ ] Test scan with various file types
  - [ ] Success: Full directory scan workflow tested

- [ ] Test database persistence and retrieval
  - [ ] Verify all file records are created correctly
    1. Add database verification tests:
       ```typescript
       test('should persist all file metadata correctly', async () => {
         const testFiles = await testHarness.fs.scanDirectory(testDir)
         
         for (const file of testFiles) {
           const dbRecord = await testHarness.db.findByPath(file.path)
           expect(dbRecord).toBeDefined()
           expect(dbRecord.name).toBe(file.name)
           expect(dbRecord.size).toBe(file.size)
           expect(dbRecord.hash_xxh3).toBeDefined()
         }
       })
       ```
  - [ ] Test vector storage operations
  - [ ] Success: Database persistence verified

- [ ] Test UI integration during operations
  - [ ] Test progress updates during scan
    1. Add UI integration tests:
       ```typescript
       test('should emit progress events during scan', async () => {
         const progressEvents: ScanProgress[] = []
         
         testHarness.onScanProgress((progress) => {
           progressEvents.push(progress)
         })
         
         await testHarness.scanDirectory(testDir)
         
         expect(progressEvents.length).toBeGreaterThan(0)
         expect(progressEvents[0].current).toBe(1)
         expect(progressEvents[progressEvents.length - 1].current).toBe(progressEvents[progressEvents.length - 1].total)
       })
       ```
  - [ ] Test error scenarios and recovery
  - [ ] Success: UI updates confirmed during operations

#### Performance Validation and Optimization
- [ ] Create performance test suite
  - [ ] Create large fixture datasets for performance testing
    1. Generate performance test data:
       ```typescript
       // Create test directory with 10,000 files of various sizes
       const generatePerformanceTestData = async () => {
         const testDir = path.join(__dirname, '../fixtures/performance-test')
         await fs.mkdir(testDir, { recursive: true })
         
         for (let i = 0; i < 10000; i++) {
           const fileName = `test-file-${i}.txt`
           const content = 'x'.repeat(Math.floor(Math.random() * 10000))
           await fs.writeFile(path.join(testDir, fileName), content)
         }
       }
       ```
  - [ ] Add memory usage monitoring utilities
  - [ ] Success: Performance test suite created

- [ ] Benchmark directory scanning performance
  - [ ] Test scan speed with different directory sizes
    1. Add performance benchmarks:
       ```typescript
       test('should scan >1000 files per minute', async () => {
         const startTime = Date.now()
         const result = await testHarness.scanDirectory(performanceTestDir)
         const endTime = Date.now()
         
         const filesPerMinute = (result.filesFound / (endTime - startTime)) * 60000
         expect(filesPerMinute).toBeGreaterThan(1000)
       })
       ```
  - [ ] Monitor memory usage during large scans
  - [ ] Success: Scan performance meets requirements

- [ ] Profile database query performance
  - [ ] Benchmark database insert operations
    1. Add database performance tests:
       ```typescript
       test('should handle batch inserts efficiently', async () => {
         const files = Array.from({ length: 1000 }, (_, i) => createTestFile(i))
         
         const startTime = Date.now()
         await testHarness.db.batchInsert(files)
         const endTime = Date.now()
         
         expect(endTime - startTime).toBeLessThan(5000) // Under 5 seconds
       })
       ```
  - [ ] Test vector search performance
  - [ ] Success: Database queries perform adequately

- [ ] Optimize any performance bottlenecks
  - [ ] Profile code execution and identify slow areas
  - [ ] Implement optimizations for identified bottlenecks
  - [ ] Success: UI remains responsive during operations

#### Cross-Platform Compatibility Verification
- [ ] Set up multi-platform testing
  - [ ] Create platform-specific test configurations
    1. Add platform detection:
       ```typescript
       const getPlatformSpecificConfig = () => {
         const platform = process.platform
         return {
           windows: platform === 'win32',
           macos: platform === 'darwin',
           linux: platform === 'linux'
         }
       }
       ```
  - [ ] Set up CI/CD testing for all platforms
  - [ ] Success: Testing environments set up for all platforms

- [ ] Test application packaging and distribution
  - [ ] Test Electron app packaging on each platform
    1. Add packaging tests:
       ```bash
       # Test packaging commands
       npm run build:win
       npm run build:mac  
       npm run build:linux
       ```
  - [ ] Verify packaged apps launch correctly
  - [ ] Success: Application builds and runs on all platforms

- [ ] Verify sqlite-vec cross-platform compatibility
  - [ ] Test vector extension loading on each platform
    1. Add platform-specific vector tests:
       ```typescript
       test('should load sqlite-vec extension on current platform', async () => {
         const vectorSupport = await testHarness.db.testVectorSupport()
         expect(vectorSupport).toBe(true)
       })
       ```
  - [ ] Test vector operations on each platform
  - [ ] Success: sqlite-vec extension works on all platforms

- [ ] Test file path handling across platforms
  - [ ] Test with Windows, POSIX path separators
  - [ ] Test with unicode filenames
  - [ ] Test with long path names
  - [ ] Success: File path handling works correctly on all platforms

#### Final Integration and Preparation
- [ ] Run complete test suite verification
  - [ ] Execute all unit tests with coverage reporting
    1. Run comprehensive test suite:
       ```bash
       npm run test:coverage
       npm run test:integration
       npm run test:performance
       ```
  - [ ] Verify >80% test coverage for business logic
  - [ ] Fix any failing tests
  - [ ] Success: All TDD checkpoints verified

- [ ] Resolve TypeScript and build issues
  - [ ] Fix all TypeScript compilation errors
    1. Run TypeScript check:
       ```bash
       npx tsc --noEmit
       ```
  - [ ] Resolve any build warnings
  - [ ] Success: No TypeScript errors remaining

- [ ] Document foundation interfaces for next slices
  - [ ] Create API documentation for exported interfaces
    1. Document key interfaces:
       ```typescript
       // src/shared/types/foundation-exports.ts
       
       // Database interfaces available to feature slices
       export { FileRepository, VectorStore } from './repositories'
       
       // IPC interfaces available to feature slices  
       export { IpcApi, IpcEvents } from './ipc'
       
       // Service interfaces available to feature slices
       export { DatabaseService, FileSystemService } from '../main/services'
       ```
  - [ ] Create integration guide for next slices
  - [ ] Success: Foundation interfaces documented for next slices

- [ ] Create deployment and packaging scripts
  - [ ] Add build scripts for all platforms
    1. Update package.json scripts:
       ```json
       {
         "scripts": {
           "build": "npm run build:main && npm run build:renderer",
           "build:main": "tsc -p tsconfig.main.json",
           "build:renderer": "vite build",
           "package:all": "electron-builder --win --mac --linux",
           "package:current": "electron-builder"
         }
       }
       ```
  - [ ] Test packaging on current platform
  - [ ] Success: Deployment scripts created and tested

#### Final Verification
- [ ] Confirm slice completion criteria
  - [ ] Verify Electron app starts and shows minimal UI
  - [ ] Verify can select and scan a directory
  - [ ] Verify files are stored in SQLite database with vector capabilities
  - [ ] Verify bidirectional IPC communication working
  - [ ] Verify >80% test coverage achieved
  - [ ] Verify cross-platform compatibility established
  - [ ] Success: All foundation slice success criteria met

## Dependencies and Blockers

**External Dependencies:**
- sqlite-vec package availability and compatibility
- Electron version compatibility with chosen libraries
- Node.js native modules compilation on target platforms

**Potential Blockers:**
- sqlite-vec extension loading failures (mitigation: pure JS fallback)
- IPC performance issues with large datasets (mitigation: streaming)
- Cross-platform compilation issues (mitigation: CI/CD testing)

## Validation Criteria

Each task must pass:
1. Unit tests with appropriate coverage
2. Integration tests for cross-component functionality
3. TypeScript compilation without errors
4. Manual testing on primary development platform

Final slice completion requires:
- All TDD checkpoints satisfied
- Success criteria from slice design met
- Foundation interfaces ready for feature slice consumption
- Cross-platform compatibility verified

## Notes for Implementation

- Prioritize TDD approach - write tests before implementation
- Use dependency injection for better testability
- Keep business logic separate from Electron-specific code
- Document any deviations from slice design
- Consider performance implications of all database operations