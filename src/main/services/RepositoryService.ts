import type { Database } from 'better-sqlite3'
import { FileRepository, VectorStore, ScanHistoryRepository } from '../../core'

export class RepositoryService {
  private fileRepository: FileRepository
  private vectorStore: VectorStore
  private scanHistoryRepository: ScanHistoryRepository

  constructor(db: Database, vectorSupport: boolean) {
    this.fileRepository = new FileRepository(db)
    this.vectorStore = new VectorStore(db, vectorSupport)
    this.scanHistoryRepository = new ScanHistoryRepository(db)
  }

  getFileRepository(): FileRepository {
    return this.fileRepository
  }

  getVectorStore(): VectorStore {
    return this.vectorStore
  }

  getScanHistoryRepository(): ScanHistoryRepository {
    return this.scanHistoryRepository
  }

  // Convenience methods for common operations
  async addFileWithEmbedding(
    file: Parameters<FileRepository['insert']>[0],
    textEmbedding?: Float32Array,
    imageEmbedding?: Float32Array
  ): Promise<number> {
    const fileId = await this.fileRepository.insert(file)
    
    if (textEmbedding) {
      this.vectorStore.addTextEmbedding(fileId, textEmbedding)
    }
    
    if (imageEmbedding) {
      this.vectorStore.addImageEmbedding(fileId, imageEmbedding)
    }
    
    return fileId
  }

  async removeFileWithEmbeddings(fileId: number): Promise<void> {
    await this.fileRepository.delete(fileId)
    this.vectorStore.removeEmbeddings(fileId)
  }
}