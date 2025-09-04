import { app } from 'electron'
import path from 'node:path'
import { DatabaseService } from '../core/services/DatabaseService'
import { FileRepository } from '../core/repositories/FileRepository'
import { ScanHistoryRepository } from '../core/repositories/ScanHistoryRepository'
import { VectorStore } from '../core/repositories/VectorStore'
import type { DatabaseConfig } from '../core/types'

/**
 * Main application class that bridges core services with Electron
 * Handles initialization, cleanup, and provides service access
 */
export class RummageApp {
  private databaseService: DatabaseService
  private fileRepository?: FileRepository
  private scanHistoryRepository?: ScanHistoryRepository
  private vectorStore?: VectorStore

  constructor(config?: DatabaseConfig) {
    this.databaseService = new DatabaseService(config)
  }

  async initialize(): Promise<void> {
    // Get default database path from Electron's userData directory
    const defaultDbPath = path.join(app.getPath('userData'), 'rummage.db')
    
    await this.databaseService.initialize(defaultDbPath)
    
    // Initialize repositories with database connection
    const db = this.databaseService.getDb()
    this.fileRepository = new FileRepository(db)
    this.scanHistoryRepository = new ScanHistoryRepository(db)
    this.vectorStore = new VectorStore(db, this.databaseService.hasVectorSupport())
  }

  async shutdown(): Promise<void> {
    await this.databaseService.close()
  }

  // Service getters - throw if not initialized
  getDatabase(): DatabaseService {
    return this.databaseService
  }

  getFileRepository(): FileRepository {
    if (!this.fileRepository) {
      throw new Error('Application not initialized')
    }
    return this.fileRepository
  }

  getScanHistoryRepository(): ScanHistoryRepository {
    if (!this.scanHistoryRepository) {
      throw new Error('Application not initialized')
    }
    return this.scanHistoryRepository
  }

  getVectorStore(): VectorStore {
    if (!this.vectorStore) {
      throw new Error('Application not initialized')
    }
    return this.vectorStore
  }

  // Helper methods for common operations
  async isReady(): Promise<boolean> {
    return this.fileRepository !== undefined
  }

  hasVectorSupport(): boolean {
    return this.databaseService.hasVectorSupport()
  }
}