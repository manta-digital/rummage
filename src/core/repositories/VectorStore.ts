import Database from 'better-sqlite3'
import type { VectorStore as IVectorStore, SimilarityResult } from '../types'

export class VectorStore implements IVectorStore {
  constructor(
    private db: Database.Database,
    private vectorSupport: boolean
  ) {}

  hasVectorSupport(): boolean {
    return this.vectorSupport
  }

  addTextEmbedding(fileId: number, embedding: Float32Array): void {
    if (!this.vectorSupport) {
      console.warn('Vector operations not supported - sqlite-vec extension not available')
      return
    }

    try {
      const stmt = this.db.prepare('INSERT OR REPLACE INTO text_embeddings (file_id, embedding) VALUES (?, ?)')
      stmt.run(fileId, Array.from(embedding))
    } catch (error) {
      console.error('Failed to add text embedding:', error)
      throw error
    }
  }

  addImageEmbedding(fileId: number, embedding: Float32Array): void {
    if (!this.vectorSupport) {
      console.warn('Vector operations not supported - sqlite-vec extension not available')
      return
    }

    try {
      const stmt = this.db.prepare('INSERT OR REPLACE INTO image_embeddings (file_id, embedding) VALUES (?, ?)')
      stmt.run(fileId, Array.from(embedding))
    } catch (error) {
      console.error('Failed to add image embedding:', error)
      throw error
    }
  }

  searchSimilar(embedding: Float32Array, limit: number = 10): SimilarityResult[] {
    if (!this.vectorSupport) {
      console.warn('Vector search not supported - sqlite-vec extension not available')
      return []
    }

    try {
      // Try text embeddings first
      const textResults = this.searchTextEmbeddings(embedding, limit)
      
      // If we have enough results from text, return those
      if (textResults.length >= limit) {
        return textResults.slice(0, limit)
      }

      // Otherwise, also search image embeddings and combine results
      const imageResults = this.searchImageEmbeddings(embedding, limit - textResults.length)
      
      // Combine and sort by distance
      const allResults = [...textResults, ...imageResults]
      allResults.sort((a, b) => a.distance - b.distance)
      
      return allResults.slice(0, limit)
    } catch (error) {
      console.warn('Vector search failed:', error)
      return []
    }
  }

  private searchTextEmbeddings(embedding: Float32Array, limit: number): SimilarityResult[] {
    try {
      // Use sqlite-vec similarity search syntax
      // Note: The exact syntax may vary depending on sqlite-vec version
      const stmt = this.db.prepare(`
        SELECT file_id, distance 
        FROM text_embeddings 
        WHERE embedding MATCH ? 
        ORDER BY distance 
        LIMIT ?
      `)
      
      const results = stmt.all(Array.from(embedding), limit) as Array<{file_id: number, distance: number}>
      return results.map(row => ({
        fileId: row.file_id,
        distance: row.distance
      }))
    } catch (error) {
      console.warn('Text embedding search failed:', error)
      return []
    }
  }

  private searchImageEmbeddings(embedding: Float32Array, limit: number): SimilarityResult[] {
    try {
      // Use sqlite-vec similarity search syntax
      const stmt = this.db.prepare(`
        SELECT file_id, distance 
        FROM image_embeddings 
        WHERE embedding MATCH ? 
        ORDER BY distance 
        LIMIT ?
      `)
      
      const results = stmt.all(Array.from(embedding), limit) as Array<{file_id: number, distance: number}>
      return results.map(row => ({
        fileId: row.file_id,
        distance: row.distance
      }))
    } catch (error) {
      console.warn('Image embedding search failed:', error)
      return []
    }
  }

  removeEmbeddings(fileId: number): void {
    if (!this.vectorSupport) {
      return
    }

    try {
      // Remove from both text and image embedding tables
      const textStmt = this.db.prepare('DELETE FROM text_embeddings WHERE file_id = ?')
      const imageStmt = this.db.prepare('DELETE FROM image_embeddings WHERE file_id = ?')
      
      textStmt.run(fileId)
      imageStmt.run(fileId)
    } catch (error) {
      console.warn('Failed to remove embeddings:', error)
      // Don't throw here - this is cleanup operation
    }
  }

  // Additional utility methods
  async getEmbeddingCount(): Promise<{text: number, image: number}> {
    if (!this.vectorSupport) {
      return { text: 0, image: 0 }
    }

    try {
      const textStmt = this.db.prepare('SELECT COUNT(*) as count FROM text_embeddings')
      const imageStmt = this.db.prepare('SELECT COUNT(*) as count FROM image_embeddings')
      
      const textResult = textStmt.get() as { count: number }
      const imageResult = imageStmt.get() as { count: number }
      
      return {
        text: textResult.count,
        image: imageResult.count
      }
    } catch (error) {
      console.warn('Failed to get embedding counts:', error)
      return { text: 0, image: 0 }
    }
  }

  async hasEmbedding(fileId: number, type: 'text' | 'image' = 'text'): Promise<boolean> {
    if (!this.vectorSupport) {
      return false
    }

    try {
      const table = type === 'text' ? 'text_embeddings' : 'image_embeddings'
      const stmt = this.db.prepare(`SELECT 1 FROM ${table} WHERE file_id = ? LIMIT 1`)
      const result = stmt.get(fileId)
      return !!result
    } catch (error) {
      console.warn('Failed to check embedding existence:', error)
      return false
    }
  }
}