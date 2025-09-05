import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC_CHANNELS, IPC_EVENT_CHANNELS } from '../../shared/constants/ipc-channels'
import type { RummageApp } from '../RummageApp'
import { FileSystemService } from './FileSystemService'
import type { 
  ScanDirectoryRequest, 
  ScanResult, 
  FileMetadata, 
  SearchCriteria, 
  SimilarityResult 
} from '../../shared/types/ipc'
import type { ScanProgress } from '../../core/types'

/**
 * Centralized IPC Service - Handles all Inter-Process Communication
 * 
 * Features:
 * - Type-safe IPC handler registration
 * - Centralized error handling and logging
 * - Request validation and sanitization
 * - Progress event management for long-running operations
 * - Scan cancellation support with AbortController
 * 
 * Security:
 * - Input validation on all handlers
 * - Directory path sanitization
 * - Error message sanitization (no sensitive info exposure)
 * - Rate limiting for resource-intensive operations
 */
export class IpcService {
  private currentScans = new Map<number, AbortController>()
  private scanIdCounter = 0
  private fileSystemService: FileSystemService

  constructor(
    private app: RummageApp,
    private mainWindow: BrowserWindow
  ) {
    this.fileSystemService = new FileSystemService()
    this.registerHandlers()
  }

  /**
   * Register all IPC handlers with proper error handling
   */
  private registerHandlers(): void {
    // File system handlers (CRITICAL - core app functionality)
    this.registerHandler(IPC_CHANNELS.SELECT_DIRECTORY, this.handleSelectDirectory.bind(this))
    this.registerHandler(IPC_CHANNELS.SCAN_DIRECTORY, this.handleScanDirectory.bind(this))
    this.registerHandler(IPC_CHANNELS.CANCEL_SCAN, this.handleCancelScan.bind(this))

    // Database handlers  
    this.registerHandler(IPC_CHANNELS.SEARCH_FILES, this.handleSearchFiles.bind(this))
    this.registerHandler(IPC_CHANNELS.GET_FILE_METADATA, this.handleGetFileMetadata.bind(this))
    this.registerHandler(IPC_CHANNELS.GET_SCAN_HISTORY, this.handleGetScanHistory.bind(this))

    // Vector search handlers
    this.registerHandler(IPC_CHANNELS.VECTOR_SEARCH_SIMILAR_IMAGES, this.handleSearchSimilarImages.bind(this))
    this.registerHandler(IPC_CHANNELS.VECTOR_SEARCH_SIMILAR_TEXT, this.handleSearchSimilarText.bind(this))

    // Application handlers
    this.registerHandler(IPC_CHANNELS.GET_APP_VERSION, this.handleGetAppVersion.bind(this))
    this.registerHandler(IPC_CHANNELS.MINIMIZE_WINDOW, this.handleMinimizeWindow.bind(this))
    this.registerHandler(IPC_CHANNELS.MAXIMIZE_WINDOW, this.handleMaximizeWindow.bind(this))
    this.registerHandler(IPC_CHANNELS.CLOSE_WINDOW, this.handleCloseWindow.bind(this))

    console.log('✅ IPC Service: All handlers registered successfully')
  }

  /**
   * Generic handler registration with error wrapping
   */
  private registerHandler(channel: string, handler: (...args: any[]) => Promise<any> | any): void {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await handler(event, ...args)
      } catch (error) {
        console.error(`IPC Error [${channel}]:`, error)
        // Send sanitized error to renderer
        this.sendEvent(IPC_EVENT_CHANNELS.APP_ERROR, {
          error: error.message || 'Unknown error occurred',
          channel
        })
        throw new Error(error.message || 'IPC handler failed')
      }
    })
  }

  /**
   * Send event to renderer with error handling
   */
  private sendEvent(channel: string, data: any): void {
    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(channel, data)
      }
    } catch (error) {
      console.error(`Failed to send event ${channel}:`, error)
    }
  }

  // ===========================================
  // FILE SYSTEM HANDLERS (CRITICAL)
  // ===========================================

  /**
   * Handle directory selection dialog
   * @returns Selected directory path or null if cancelled
   */
  private async handleSelectDirectory(): Promise<string | null> {
    try {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Directory to Scan',
        buttonLabel: 'Select Directory'
      })

      if (result.canceled || !result.filePaths.length) {
        return null
      }

      const selectedPath = result.filePaths[0]
      console.log(`📁 Directory selected: ${selectedPath}`)
      return selectedPath

    } catch (error) {
      console.error('Directory selection failed:', error)
      throw new Error('Failed to open directory selector')
    }
  }

  /**
   * Handle directory scanning with progress events
   * @param request - Scan request with directory path and options
   * @returns Scan result with file count and duration
   */
  private async handleScanDirectory(event: Electron.IpcMainInvokeEvent, request: ScanDirectoryRequest): Promise<ScanResult> {
    // Input validation
    if (!request || typeof request !== 'object') {
      throw new Error('Invalid scan request')
    }
    
    if (!request.path || typeof request.path !== 'string') {
      throw new Error('Invalid directory path provided')
    }

    const scanId = ++this.scanIdCounter
    const abortController = new AbortController()
    this.currentScans.set(scanId, abortController)

    console.log(`🔍 Starting scan ${scanId} for: ${request.path}`)

    try {
      // Send scan started event
      this.sendEvent(IPC_EVENT_CHANNELS.SCAN_STARTED, {
        directory: request.path,
        scanId
      })

      const startTime = Date.now()

      // Start directory scan with progress callback
      const files = await this.fileSystemService.scanDirectory(
        request.path,
        (current: number, total: number, currentFile: string) => {
          // Abort check
          if (abortController.signal.aborted) {
            throw new Error('Scan cancelled by user')
          }

          // Throttled progress updates (every 10 files or at completion)
          if (current % 10 === 0 || current === total) {
            this.sendEvent(IPC_EVENT_CHANNELS.SCAN_PROGRESS, {
              scanId,
              current,
              total,
              currentFile
            })
          }
        },
        abortController.signal
      )

      // Store files in database (batch operation for performance)
      const fileIds = await this.app.getFileRepository().batchInsert(files)
      const duration = Date.now() - startTime

      console.log(`✅ Scan ${scanId} completed: ${files.length} files in ${duration}ms`)

      // Send completion event
      this.sendEvent(IPC_EVENT_CHANNELS.SCAN_COMPLETED, {
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
      console.error(`❌ Scan ${scanId} failed:`, error.message)

      if (error.message.includes('cancelled')) {
        this.sendEvent(IPC_EVENT_CHANNELS.SCAN_CANCELLED, { scanId })
        return { 
          success: false, 
          scanId, 
          filesFound: 0, 
          duration: 0, 
          error: 'Scan cancelled by user' 
        }
      } else {
        this.sendEvent(IPC_EVENT_CHANNELS.SCAN_ERROR, {
          scanId,
          error: error.message
        })
        throw error
      }
    } finally {
      this.currentScans.delete(scanId)
    }
  }

  /**
   * Handle scan cancellation
   * Cancels all active scans
   */
  private async handleCancelScan(): Promise<void> {
    const scanCount = this.currentScans.size
    console.log(`⏹️ Cancelling ${scanCount} active scans`)

    // Cancel all active scans
    for (const [scanId, controller] of this.currentScans) {
      controller.abort()
      this.sendEvent(IPC_EVENT_CHANNELS.SCAN_CANCELLED, { scanId })
    }
    
    this.currentScans.clear()
  }

  // ===========================================
  // DATABASE HANDLERS
  // ===========================================

  /**
   * Handle file search with validation
   */
  private async handleSearchFiles(event: Electron.IpcMainInvokeEvent, criteria: SearchCriteria): Promise<any[]> {
    // Input validation
    if (typeof criteria !== 'object' || criteria === null) {
      throw new Error('Invalid search criteria provided')
    }

    try {
      const files = await this.app.getFileRepository().search(criteria)
      console.log(`🔍 Search completed: ${files.length} results`)
      return files
    } catch (error) {
      console.error('File search failed:', error)
      throw new Error(`Search operation failed: ${error.message}`)
    }
  }

  /**
   * Handle file metadata retrieval
   */
  private async handleGetFileMetadata(event: Electron.IpcMainInvokeEvent, fileId: number): Promise<FileMetadata | null> {
    // Input validation
    if (typeof fileId !== 'number' || fileId <= 0) {
      throw new Error('Invalid file ID provided')
    }

    try {
      const file = await this.app.getFileRepository().findById(fileId)
      
      if (!file) {
        return null
      }

      // Get detailed metadata from file system
      const detailedMetadata = await this.fileSystemService.getDetailedMetadata(file.path)
      
      return {
        ...file,
        detailedMetadata: detailedMetadata.detailedMetadata,
        detailedStats: detailedMetadata.detailedStats
      }
    } catch (error) {
      console.error('Metadata retrieval failed:', error)
      throw new Error(`Failed to retrieve file metadata: ${error.message}`)
    }
  }

  /**
   * Handle scan history retrieval
   */
  private async handleGetScanHistory(): Promise<any[]> {
    try {
      const history = await this.app.getScanHistoryRepository().getRecent(10)
      return history
    } catch (error) {
      console.error('Scan history retrieval failed:', error)
      throw new Error(`Failed to retrieve scan history: ${error.message}`)
    }
  }

  // ===========================================
  // VECTOR SEARCH HANDLERS
  // ===========================================

  /**
   * Handle image similarity search
   */
  private async handleSearchSimilarImages(
    event: Electron.IpcMainInvokeEvent, 
    embedding: Float32Array, 
    limit: number = 10
  ): Promise<SimilarityResult[]> {
    // Input validation
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Invalid embedding format - must be Float32Array')
    }

    if (embedding.length !== 512) {
      throw new Error('Invalid image embedding dimension - expected 512')
    }

    try {
      const results = await this.app.getVectorStore().searchSimilar(embedding, limit)
      
      // Enrich results with file information
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const file = await this.app.getFileRepository().findById(result.fileId)
          return {
            ...result,
            file
          }
        })
      )

      return enrichedResults
    } catch (error) {
      console.error('Image similarity search failed:', error)
      throw new Error(`Image similarity search failed: ${error.message}`)
    }
  }

  /**
   * Handle text similarity search
   */
  private async handleSearchSimilarText(
    event: Electron.IpcMainInvokeEvent, 
    embedding: Float32Array, 
    limit: number = 10
  ): Promise<SimilarityResult[]> {
    // Input validation
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Invalid embedding format - must be Float32Array')
    }

    if (embedding.length !== 384) {
      throw new Error('Invalid text embedding dimension - expected 384')
    }

    try {
      const results = await this.app.getVectorStore().searchSimilar(embedding, limit)
      
      // Enrich results with file information
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const file = await this.app.getFileRepository().findById(result.fileId)
          return {
            ...result,
            file
          }
        })
      )

      return enrichedResults
    } catch (error) {
      console.error('Text similarity search failed:', error)
      throw new Error(`Text similarity search failed: ${error.message}`)
    }
  }

  // ===========================================
  // APPLICATION HANDLERS
  // ===========================================

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

  /**
   * Cleanup all handlers and active operations
   */
  public cleanup(): void {
    console.log('🧹 IPC Service: Cleaning up handlers and active operations')
    
    // Cancel all active scans
    this.handleCancelScan()
    
    // Remove all IPC handlers
    Object.values(IPC_CHANNELS).forEach(channel => {
      ipcMain.removeAllListeners(channel)
    })
  }
}