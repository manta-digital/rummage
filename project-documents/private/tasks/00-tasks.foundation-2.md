---
slice_name: foundation-2
project: rummage
lld_reference: project-documents/private/slices/00-slice.foundation.md
dependencies: []
estimated_effort: 5-7 days
phase: "Phase 6: Slice Execution"
created: 2025-08-30
lastUpdated: 2025-08-31
status: ready_for_execution
---

# Task Breakdown: Foundation Slice

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
- > 80% test coverage achieved
- Cross-platform compatibility (Windows, macOS, Linux)

## Granular Tasks

### Day 3: IPC Architecture Implementation

#### Define IPC Protocol Contracts

- [ ] Create comprehensive IPC type definitions

  - [ ] Create `src/shared/types/ipc.ts` with all API interfaces

    1. Define main IPC API interface:

       ```typescript
       export interface IpcApi {
         // File System Operations
         selectDirectory(): Promise<string | null>;
         scanDirectory(path: string): Promise<ScanResult>;
         cancelScan(): Promise<void>;

         // Database Operations
         searchFiles(criteria: SearchCriteria): Promise<File[]>;
         getFileMetadata(fileId: number): Promise<FileMetadata>;
         getScanHistory(): Promise<ScanHistory[]>;

         // Vector Search Operations
         searchSimilarImages(
           embedding: Float32Array,
           limit?: number
         ): Promise<SimilarityResult[]>;
         searchSimilarText(
           embedding: Float32Array,
           limit?: number
         ): Promise<SimilarityResult[]>;

         // Application Operations
         getAppVersion(): Promise<string>;
         minimizeWindow(): Promise<void>;
         maximizeWindow(): Promise<void>;
         closeWindow(): Promise<void>;
       }
       ```

  - [ ] Define event interfaces for bidirectional communication

    1. Create event type definitions:

       ```typescript
       export interface IpcEvents {
         // Scan Progress Events
         "scan:started": (data: { directory: string; scanId: number }) => void;
         "scan:progress": (data: {
           scanId: number;
           current: number;
           total: number;
           currentFile: string;
         }) => void;
         "scan:completed": (data: {
           scanId: number;
           filesFound: number;
           duration: number;
         }) => void;
         "scan:cancelled": (data: { scanId: number }) => void;
         "scan:error": (data: { scanId: number; error: string }) => void;

         // Application Events
         "app:error": (data: { error: string; details?: any }) => void;
         "app:status": (data: { status: "ready" | "busy" | "error" }) => void;
       }
       ```

  - [ ] Create request/response type definitions

    1. Define request and response types:

       ```typescript
       export interface ScanDirectoryRequest {
         path: string;
         options?: {
           includeHidden?: boolean;
           maxDepth?: number;
           fileTypes?: string[];
         };
       }

       export interface ScanResult {
         success: boolean;
         scanId: number;
         filesFound: number;
         duration: number;
         error?: string;
       }

       export interface SearchCriteria {
         mimeTypes?: string[];
         sizeMin?: number;
         sizeMax?: number;
         dateRange?: { start: number; end: number };
         textQuery?: string;
         limit?: number;
         offset?: number;
       }
       ```

  - [ ] Success: IPC API interfaces defined with full TypeScript support

- [ ] Document channel naming conventions and security boundaries

  - [ ] Create `src/shared/constants/ipc-channels.ts` with standardized channel names

    1. Define channel constants:

       ```typescript
       export const IPC_CHANNELS = {
         // File System Channels
         SELECT_DIRECTORY: "fs:select-directory",
         SCAN_DIRECTORY: "fs:scan-directory",
         CANCEL_SCAN: "fs:cancel-scan",

         // Database Channels
         SEARCH_FILES: "db:search-files",
         GET_FILE_METADATA: "db:get-file-metadata",
         GET_SCAN_HISTORY: "db:get-scan-history",

         // Vector Search Channels
         SEARCH_SIMILAR_IMAGES: "vector:search-images",
         SEARCH_SIMILAR_TEXT: "vector:search-text",

         // Application Channels
         GET_APP_VERSION: "app:get-version",
         MINIMIZE_WINDOW: "app:minimize",
         MAXIMIZE_WINDOW: "app:maximize",
         CLOSE_WINDOW: "app:close",
       } as const;
       ```

  - [ ] Add security documentation for each channel
  - [ ] Success: Channel naming conventions standardized and documented

- [ ] Create TypeScript declaration file for renderer process

  - [ ] Create `src/renderer/types/electron.d.ts` file

    1. Add global type declarations:

       ```typescript
       import { IpcApi, IpcEvents } from "../shared/types/ipc";

       declare global {
         interface Window {
           electronAPI: IpcApi & {
             // Event listener methods
             onScanProgress(callback: IpcEvents["scan:progress"]): void;
             onScanCompleted(callback: IpcEvents["scan:completed"]): void;
             onScanCancelled(callback: IpcEvents["scan:cancelled"]): void;
             onScanError(callback: IpcEvents["scan:error"]): void;
             onAppError(callback: IpcEvents["app:error"]): void;
             onAppStatus(callback: IpcEvents["app:status"]): void;

             // Event cleanup methods
             removeAllListeners(channel: keyof IpcEvents): void;
           };
         }
       }

       export {};
       ```

  - [ ] Ensure strict typing prevents runtime errors
  - [ ] Success: Type safety enforced across main/renderer boundary

#### Implement Secure Context Bridge

- [ ] Create secure preload script with context isolation

  - [ ] Create `src/preload/index.ts` with contextBridge setup

    1. Implement secure IPC bridge:

       ```typescript
       import { contextBridge, ipcRenderer } from "electron";
       import { IPC_CHANNELS } from "../shared/constants/ipc-channels";
       import type {
         IpcApi,
         ScanDirectoryRequest,
         SearchCriteria,
       } from "../shared/types/ipc";

       // Define the API that will be exposed to the renderer process
       const electronAPI: IpcApi = {
         // File System Operations
         selectDirectory: () =>
           ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY),
         scanDirectory: (path: string) => {
           if (typeof path !== "string" || !path.trim()) {
             throw new Error("Invalid directory path provided");
           }
           return ipcRenderer.invoke(IPC_CHANNELS.SCAN_DIRECTORY, { path });
         },
         cancelScan: () => ipcRenderer.invoke(IPC_CHANNELS.CANCEL_SCAN),

         // Database Operations
         searchFiles: (criteria: SearchCriteria) => {
           // Input validation
           if (typeof criteria !== "object" || criteria === null) {
             throw new Error("Invalid search criteria provided");
           }
           return ipcRenderer.invoke(IPC_CHANNELS.SEARCH_FILES, criteria);
         },

         // Continue with all other methods...
       };
       ```

  - [ ] Add input validation for all exposed methods

    1. Implement comprehensive input validation:

       ```typescript
       const validateSearchCriteria = (criteria: any): SearchCriteria => {
         if (typeof criteria !== "object" || criteria === null) {
           throw new Error("Search criteria must be an object");
         }

         const validated: SearchCriteria = {};

         if (criteria.mimeTypes !== undefined) {
           if (!Array.isArray(criteria.mimeTypes)) {
             throw new Error("mimeTypes must be an array");
           }
           validated.mimeTypes = criteria.mimeTypes.filter(
             (type) => typeof type === "string"
           );
         }

         if (criteria.sizeMin !== undefined) {
           if (typeof criteria.sizeMin !== "number" || criteria.sizeMin < 0) {
             throw new Error("sizeMin must be a positive number");
           }
           validated.sizeMin = criteria.sizeMin;
         }

         // Continue validation for all fields...
         return validated;
       };
       ```

  - [ ] Success: Preload script created with proper context isolation

- [ ] Implement safe event listener system

  - [ ] Add secure event listener methods to preload script

    1. Implement event listener management:

       ```typescript
       const eventAPI = {
         // Progress event listeners
         onScanProgress: (callback: (data: any) => void) => {
           ipcRenderer.on("scan:progress", (_, data) => {
             if (typeof callback === "function") {
               callback(data);
             }
           });
         },

         onScanCompleted: (callback: (data: any) => void) => {
           ipcRenderer.on("scan:completed", (_, data) => {
             if (typeof callback === "function") {
               callback(data);
             }
           });
         },

         // Cleanup method
         removeAllListeners: (channel: string) => {
           if (typeof channel === "string") {
             ipcRenderer.removeAllListeners(channel);
           }
         },
       };

       // Expose to renderer with validation
       contextBridge.exposeInMainWorld("electronAPI", {
         ...electronAPI,
         ...eventAPI,
       });
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
           preload: path.join(__dirname, "../preload/index.js"),
           sandbox: false, // Required for better-sqlite3 integration
         },
       });
       ```
  - [ ] Verify security settings prevent direct Node.js access
  - [ ] Success: Security audit passes - no direct IPC access from renderer

- [ ] Write security validation tests

  - [ ] Create `src/tests/security/preload-security.test.ts`

    1. Test context isolation:

       ```typescript
       describe("Preload Security", () => {
         test("should not expose Node.js globals to renderer", async () => {
           // Mock renderer environment
           const rendererGlobals = Object.keys(global);
           const dangerousGlobals = [
             "process",
             "Buffer",
             "global",
             "__dirname",
             "__filename",
           ];

           dangerousGlobals.forEach((dangerousGlobal) => {
             expect(rendererGlobals).not.toContain(dangerousGlobal);
           });
         });

         test("should validate all IPC method inputs", async () => {
           // Test input validation for each exposed method
           expect(() => electronAPI.scanDirectory("")).toThrow(
             "Invalid directory path"
           );
           expect(() => electronAPI.searchFiles(null)).toThrow(
             "Invalid search criteria"
           );
         });
       });
       ```

  - [ ] Test that sensitive APIs are not exposed
  - [ ] Success: Security tests pass and verify proper isolation

#### Create IPC Service Handlers in Main Process

- [ ] Create centralized IPC service class

  - [ ] Create `src/main/services/IpcService.ts` file

    1. Implement IPC service structure:

       ```typescript
       import { ipcMain, dialog, BrowserWindow } from "electron";
       import { IPC_CHANNELS } from "../../shared/constants/ipc-channels";
       import { DatabaseService } from "./DatabaseService";
       import { FileSystemService } from "./FileSystemService";
       import { RepositoryService } from "./RepositoryService";

       export class IpcService {
         private currentScans = new Map<number, AbortController>();
         private scanIdCounter = 0;

         constructor(
           private databaseService: DatabaseService,
           private fileSystemService: FileSystemService,
           private repositoryService: RepositoryService,
           private mainWindow: BrowserWindow
         ) {
           this.registerHandlers();
         }

         private registerHandlers(): void {
           // File system handlers
           ipcMain.handle(
             IPC_CHANNELS.SELECT_DIRECTORY,
             this.handleSelectDirectory.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.SCAN_DIRECTORY,
             this.handleScanDirectory.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.CANCEL_SCAN,
             this.handleCancelScan.bind(this)
           );

           // Database handlers
           ipcMain.handle(
             IPC_CHANNELS.SEARCH_FILES,
             this.handleSearchFiles.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.GET_FILE_METADATA,
             this.handleGetFileMetadata.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.GET_SCAN_HISTORY,
             this.handleGetScanHistory.bind(this)
           );

           // Vector search handlers
           ipcMain.handle(
             IPC_CHANNELS.SEARCH_SIMILAR_IMAGES,
             this.handleSearchSimilarImages.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.SEARCH_SIMILAR_TEXT,
             this.handleSearchSimilarText.bind(this)
           );

           // Application handlers
           ipcMain.handle(
             IPC_CHANNELS.GET_APP_VERSION,
             this.handleGetAppVersion.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.MINIMIZE_WINDOW,
             this.handleMinimizeWindow.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.MAXIMIZE_WINDOW,
             this.handleMaximizeWindow.bind(this)
           );
           ipcMain.handle(
             IPC_CHANNELS.CLOSE_WINDOW,
             this.handleCloseWindow.bind(this)
           );
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
       describe("IPC Integration", () => {
         let ipcService: IpcService;
         let mockWindow: BrowserWindow;

         beforeEach(async () => {
           mockWindow = new BrowserWindow({ show: false });
           ipcService = new IpcService(
             mockDatabaseService,
             mockFileSystemService,
             mockRepositoryService,
             mockWindow
           );
         });

         test("should handle directory selection", async () => {
           const result = await ipcRenderer.invoke(
             IPC_CHANNELS.SELECT_DIRECTORY
           );
           expect(typeof result === "string" || result === null).toBe(true);
         });

         test("should handle directory scan with progress events", async () => {
           const progressEvents: any[] = [];

           ipcRenderer.on("scan:progress", (_, data) => {
             progressEvents.push(data);
           });

           const scanResult = await ipcRenderer.invoke(
             IPC_CHANNELS.SCAN_DIRECTORY,
             {
               path: "/test/directory",
             }
           );

           expect(scanResult.success).toBe(true);
           expect(progressEvents.length).toBeGreaterThan(0);
         });

         test("should handle file search operations", async () => {
           const criteria = { mimeTypes: ["image/jpeg"], limit: 10 };
           const results = await ipcRenderer.invoke(
             IPC_CHANNELS.SEARCH_FILES,
             criteria
           );

           expect(Array.isArray(results)).toBe(true);
         });
       });
       ```

  - [ ] Test error scenarios and edge cases
  - [ ] Test security boundaries and input validation
  - [ ] Success: IPC integration tests pass with comprehensive coverage
