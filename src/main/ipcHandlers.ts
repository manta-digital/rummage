import { ipcMain, dialog, BrowserWindow } from 'electron'
import type { RummageApp } from './RummageApp'
import { IPC_CHANNELS, IPC_EVENT_CHANNELS } from '../shared/constants/ipc-channels'
import type { ScanDirectoryRequest } from '../shared/types/ipc'

// Global state for scan operations
let currentScans = new Map<number, AbortController>()
let scanIdCounter = 0
let mainWindow: BrowserWindow | null = null

/**
 * Sets up IPC handlers for communication between main and renderer processes
 * Uses formal channel constants and provides secure access to core services
 */
export function setupIpcHandlers(app: RummageApp, window?: BrowserWindow): void {
  if (window) {
    mainWindow = window
  }
  // Basic connectivity test
  ipcMain.handle(IPC_CHANNELS.PING, () => 'pong')

  // Database metadata operations
  ipcMain.handle(IPC_CHANNELS.GET_SCHEMA_VERSION, () => {
    const db = app.getDatabase()
    return db.getMeta('schema_version')
  })

  ipcMain.handle(IPC_CHANNELS.SET_META, (_event, key: string, value: string) => {
    const db = app.getDatabase()
    db.setMeta(key, value)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.HAS_VECTOR_SUPPORT, () => {
    return app.hasVectorSupport()
  })

  // CRITICAL: File system operations (core app functionality)
  ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
    if (!mainWindow) {
      throw new Error('Main window not available')
    }

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Directory to Scan',
        buttonLabel: 'Select Directory'
      })

      if (result.canceled || !result.filePaths.length) {
        return null
      }

      return result.filePaths[0]
    } catch (error) {
      console.error('Directory selection failed:', error)
      throw new Error('Failed to open directory selector')
    }
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_DIRECTORY, async (_event, request: ScanDirectoryRequest) => {
    if (!request || !request.path) {
      throw new Error('Invalid scan request')
    }

    const scanId = ++scanIdCounter
    const abortController = new AbortController()
    currentScans.set(scanId, abortController)

    try {
      console.log(`🔍 Starting scan ${scanId} for: ${request.path}`)

      // Send scan started event
      if (mainWindow) {
        mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_STARTED, {
          directory: request.path,
          scanId
        })
      }

      const startTime = Date.now()
      const fileSystemService = app.getFileSystemService()

      // Start directory scan with progress callback
      const files = await fileSystemService.scanDirectory(
        request.path,
        (current: number, total: number, currentFile: string) => {
          if (abortController.signal.aborted) {
            throw new Error('Scan cancelled by user')
          }

          // Send progress updates (throttled)
          if (mainWindow && (current % 10 === 0 || current === total)) {
            mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_PROGRESS, {
              scanId,
              current,
              total,
              currentFile
            })
          }
        },
        abortController.signal
      )

      // Store files in database
      const fileIds = await app.getFileRepository().batchInsert(files)
      const duration = Date.now() - startTime

      console.log(`✅ Scan ${scanId} completed: ${files.length} files in ${duration}ms`)

      // Send completion event
      if (mainWindow) {
        mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_COMPLETED, {
          scanId,
          filesFound: files.length,
          duration
        })
      }

      return {
        success: true,
        scanId,
        filesFound: files.length,
        duration
      }

    } catch (error) {
      console.error(`❌ Scan ${scanId} failed:`, error.message)

      if (error.message.includes('cancelled')) {
        if (mainWindow) {
          mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_CANCELLED, { scanId })
        }
        return { 
          success: false, 
          scanId, 
          filesFound: 0, 
          duration: 0, 
          error: 'Scan cancelled by user' 
        }
      } else {
        if (mainWindow) {
          mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_ERROR, {
            scanId,
            error: error.message
          })
        }
        throw error
      }
    } finally {
      currentScans.delete(scanId)
    }
  })

  ipcMain.handle(IPC_CHANNELS.CANCEL_SCAN, async () => {
    const scanCount = currentScans.size
    console.log(`⏹️ Cancelling ${scanCount} active scans`)

    for (const [scanId, controller] of currentScans) {
      controller.abort()
      if (mainWindow) {
        mainWindow.webContents.send(IPC_EVENT_CHANNELS.SCAN_CANCELLED, { scanId })
      }
    }
    
    currentScans.clear()
  })

  // File operations
  ipcMain.handle(IPC_CHANNELS.FILES_FIND_BY_ID, async (_event, id: number) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.findById(id)
  })

  ipcMain.handle(IPC_CHANNELS.FILES_FIND_BY_PATH, async (_event, path: string) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.findByPath(path)
  })

  ipcMain.handle(IPC_CHANNELS.FILES_SEARCH, async (_event, criteria: any) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.search(criteria)
  })

  ipcMain.handle(IPC_CHANNELS.FILES_GET_ALL, async () => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.getAllFiles()
  })

  ipcMain.handle(IPC_CHANNELS.FILES_INSERT, async (_event, fileInfo: any) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.insert(fileInfo)
  })

  ipcMain.handle(IPC_CHANNELS.FILES_UPDATE, async (_event, id: number, updates: any) => {
    const fileRepo = app.getFileRepository()
    await fileRepo.update(id, updates)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.FILES_DELETE, async (_event, id: number) => {
    const fileRepo = app.getFileRepository()
    await fileRepo.delete(id)
    return true
  })

  ipcMain.handle('files:batchInsert', async (_event, files: any[]) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.batchInsert(files)
  })

  // Scan history operations
  ipcMain.handle(IPC_CHANNELS.SCAN_HISTORY_CREATE, async (_event, directory: string) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.create(directory)
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_HISTORY_UPDATE, async (_event, id: number, updates: any) => {
    const scanRepo = app.getScanHistoryRepository()
    await scanRepo.update(id, updates)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_HISTORY_FIND_BY_DIRECTORY, async (_event, directory: string) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.findByDirectory(directory)
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_HISTORY_GET_RECENT, async (_event, limit?: number) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.getRecent(limit)
  })

  // Vector operations
  ipcMain.handle(IPC_CHANNELS.VECTOR_ADD_TEXT_EMBEDDING, (_event, fileId: number, embedding: number[]) => {
    const vectorStore = app.getVectorStore()
    vectorStore.addTextEmbedding(fileId, new Float32Array(embedding))
    return true
  })

  ipcMain.handle(IPC_CHANNELS.VECTOR_ADD_IMAGE_EMBEDDING, (_event, fileId: number, embedding: number[]) => {
    const vectorStore = app.getVectorStore()
    vectorStore.addImageEmbedding(fileId, new Float32Array(embedding))
    return true
  })

  ipcMain.handle('vector:searchSimilar', (_event, embedding: number[], limit: number = 10) => {
    const vectorStore = app.getVectorStore()
    return vectorStore.searchSimilar(new Float32Array(embedding), limit)
  })

  ipcMain.handle(IPC_CHANNELS.VECTOR_REMOVE_EMBEDDINGS, (_event, fileId: number) => {
    const vectorStore = app.getVectorStore()
    vectorStore.removeEmbeddings(fileId)
    return true
  })
}

/**
 * Clean up IPC handlers and cancel active operations
 */
export function cleanupIpcHandlers(): void {
  console.log('🧹 Cleaning up IPC handlers and active operations')
  
  // Cancel all active scans
  const scanCount = currentScans.size
  if (scanCount > 0) {
    console.log(`⏹️ Cancelling ${scanCount} active scans during cleanup`)
    for (const [scanId, controller] of currentScans) {
      controller.abort()
    }
    currentScans.clear()
  }
  
  // Remove all IPC listeners
  Object.values(IPC_CHANNELS).forEach(channel => {
    ipcMain.removeAllListeners(channel)
  })
  
  // Reset state
  mainWindow = null
}