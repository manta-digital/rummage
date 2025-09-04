import { ipcMain } from 'electron'
import type { RummageApp } from './RummageApp'
import { IPC_CHANNELS } from '../shared/constants/ipc-channels'

/**
 * Sets up IPC handlers for communication between main and renderer processes
 * Uses formal channel constants and provides secure access to core services
 */
export function setupIpcHandlers(app: RummageApp): void {
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
 * Clean up IPC handlers
 */
export function cleanupIpcHandlers(): void {
  ipcMain.removeAllListeners('ping')
  ipcMain.removeAllListeners('db:getSchemaVersion')
  ipcMain.removeAllListeners('db:setMeta')
  ipcMain.removeAllListeners('db:hasVectorSupport')
  
  // File handlers
  const fileChannels = [
    'files:findById', 'files:findByPath', 'files:search', 'files:getAllFiles',
    'files:insert', 'files:update', 'files:delete', 'files:batchInsert'
  ]
  fileChannels.forEach(channel => ipcMain.removeAllListeners(channel))

  // Scan history handlers
  const scanChannels = [
    'scanHistory:create', 'scanHistory:update', 
    'scanHistory:findByDirectory', 'scanHistory:getRecent'
  ]
  scanChannels.forEach(channel => ipcMain.removeAllListeners(channel))

  // Vector handlers
  const vectorChannels = [
    'vector:addTextEmbedding', 'vector:addImageEmbedding',
    'vector:searchSimilar', 'vector:removeEmbeddings'
  ]
  vectorChannels.forEach(channel => ipcMain.removeAllListeners(channel))
}