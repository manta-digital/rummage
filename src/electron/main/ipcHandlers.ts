import { ipcMain } from 'electron'
import type { RummageApp } from './RummageApp'

/**
 * Sets up IPC handlers for communication between main and renderer processes
 * Provides secure access to core services through defined contracts
 */
export function setupIpcHandlers(app: RummageApp): void {
  // Basic connectivity test
  ipcMain.handle('ping', () => 'pong')

  // Database metadata operations
  ipcMain.handle('db:getSchemaVersion', () => {
    const db = app.getDatabase()
    return db.getMeta('schema_version')
  })

  ipcMain.handle('db:setMeta', (_event, key: string, value: string) => {
    const db = app.getDatabase()
    db.setMeta(key, value)
    return true
  })

  ipcMain.handle('db:hasVectorSupport', () => {
    return app.hasVectorSupport()
  })

  // File operations
  ipcMain.handle('files:findById', async (_event, id: number) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.findById(id)
  })

  ipcMain.handle('files:findByPath', async (_event, path: string) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.findByPath(path)
  })

  ipcMain.handle('files:search', async (_event, criteria: any) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.search(criteria)
  })

  ipcMain.handle('files:getAllFiles', async () => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.getAllFiles()
  })

  ipcMain.handle('files:insert', async (_event, fileInfo: any) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.insert(fileInfo)
  })

  ipcMain.handle('files:update', async (_event, id: number, updates: any) => {
    const fileRepo = app.getFileRepository()
    await fileRepo.update(id, updates)
    return true
  })

  ipcMain.handle('files:delete', async (_event, id: number) => {
    const fileRepo = app.getFileRepository()
    await fileRepo.delete(id)
    return true
  })

  ipcMain.handle('files:batchInsert', async (_event, files: any[]) => {
    const fileRepo = app.getFileRepository()
    return await fileRepo.batchInsert(files)
  })

  // Scan history operations
  ipcMain.handle('scanHistory:create', async (_event, directory: string) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.create(directory)
  })

  ipcMain.handle('scanHistory:update', async (_event, id: number, updates: any) => {
    const scanRepo = app.getScanHistoryRepository()
    await scanRepo.update(id, updates)
    return true
  })

  ipcMain.handle('scanHistory:findByDirectory', async (_event, directory: string) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.findByDirectory(directory)
  })

  ipcMain.handle('scanHistory:getRecent', async (_event, limit?: number) => {
    const scanRepo = app.getScanHistoryRepository()
    return await scanRepo.getRecent(limit)
  })

  // Vector operations
  ipcMain.handle('vector:addTextEmbedding', (_event, fileId: number, embedding: number[]) => {
    const vectorStore = app.getVectorStore()
    vectorStore.addTextEmbedding(fileId, new Float32Array(embedding))
    return true
  })

  ipcMain.handle('vector:addImageEmbedding', (_event, fileId: number, embedding: number[]) => {
    const vectorStore = app.getVectorStore()
    vectorStore.addImageEmbedding(fileId, new Float32Array(embedding))
    return true
  })

  ipcMain.handle('vector:searchSimilar', (_event, embedding: number[], limit: number = 10) => {
    const vectorStore = app.getVectorStore()
    return vectorStore.searchSimilar(new Float32Array(embedding), limit)
  })

  ipcMain.handle('vector:removeEmbeddings', (_event, fileId: number) => {
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