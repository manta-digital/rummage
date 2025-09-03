import Database from 'better-sqlite3'
import type { File, FileInfo, FileRepository as IFileRepository, SearchCriteria } from '../types'

export class FileRepository implements IFileRepository {
  constructor(private db: Database.Database) {}

  async findById(id: number): Promise<File | null> {
    const stmt = this.db.prepare('SELECT * FROM files WHERE id = ?')
    const row = stmt.get(id) as any
    return row ? this.mapRowToFile(row) : null
  }

  async findByPath(path: string): Promise<File | null> {
    const stmt = this.db.prepare('SELECT * FROM files WHERE path = ?')
    const row = stmt.get(path) as any
    return row ? this.mapRowToFile(row) : null
  }

  async getAllFiles(): Promise<File[]> {
    const stmt = this.db.prepare('SELECT * FROM files ORDER BY created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map(row => this.mapRowToFile(row))
  }

  async search(criteria: SearchCriteria): Promise<File[]> {
    let sql = 'SELECT * FROM files WHERE 1=1'
    const params: any[] = []

    if (criteria.mimeTypes && criteria.mimeTypes.length > 0) {
      const placeholders = criteria.mimeTypes.map(() => '?').join(',')
      sql += ` AND mime_type IN (${placeholders})`
      params.push(...criteria.mimeTypes)
    }

    if (criteria.sizeMin !== undefined) {
      sql += ' AND size >= ?'
      params.push(criteria.sizeMin)
    }

    if (criteria.sizeMax !== undefined) {
      sql += ' AND size <= ?'
      params.push(criteria.sizeMax)
    }

    if (criteria.dateRange) {
      sql += ' AND created_at >= ? AND created_at <= ?'
      params.push(criteria.dateRange.start, criteria.dateRange.end)
    }

    if (criteria.textQuery) {
      sql += ' AND (name LIKE ? OR path LIKE ?)'
      const searchPattern = `%${criteria.textQuery}%`
      params.push(searchPattern, searchPattern)
    }

    sql += ' ORDER BY created_at DESC'

    if (criteria.limit) {
      sql += ' LIMIT ?'
      params.push(criteria.limit)
    }

    if (criteria.offset) {
      sql += ' OFFSET ?'
      params.push(criteria.offset)
    }

    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...params) as any[]
    return rows.map(row => this.mapRowToFile(row))
  }

  async insert(file: FileInfo): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, hash_blake3, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      file.path,
      file.name,
      file.size,
      file.mimeType,
      file.createdAt,
      file.modifiedAt,
      file.hashXxh3 || null,
      file.hashBlake3 || null,
      JSON.stringify(file.metadata)
    )
    
    return result.lastInsertRowid as number
  }

  async batchInsert(files: FileInfo[]): Promise<number[]> {
    const stmt = this.db.prepare(`
      INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, hash_blake3, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertMany = this.db.transaction((files: FileInfo[]) => {
      const ids: number[] = []
      for (const file of files) {
        const result = stmt.run(
          file.path,
          file.name,
          file.size,
          file.mimeType,
          file.createdAt,
          file.modifiedAt,
          file.hashXxh3 || null,
          file.hashBlake3 || null,
          JSON.stringify(file.metadata)
        )
        ids.push(result.lastInsertRowid as number)
      }
      return ids
    })

    return insertMany(files)
  }

  async update(id: number, updates: Partial<File>): Promise<void> {
    const fields: string[] = []
    const params: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      params.push(updates.name)
    }

    if (updates.size !== undefined) {
      fields.push('size = ?')
      params.push(updates.size)
    }

    if (updates.mimeType !== undefined) {
      fields.push('mime_type = ?')
      params.push(updates.mimeType)
    }

    if (updates.modifiedAt !== undefined) {
      fields.push('modified_at = ?')
      params.push(updates.modifiedAt)
    }

    if (updates.hashXxh3 !== undefined) {
      fields.push('hash_xxh3 = ?')
      params.push(updates.hashXxh3)
    }

    if (updates.hashBlake3 !== undefined) {
      fields.push('hash_blake3 = ?')
      params.push(updates.hashBlake3)
    }

    if (updates.metadata !== undefined) {
      fields.push('metadata = ?')
      params.push(JSON.stringify(updates.metadata))
    }

    if (fields.length === 0) {
      return // No updates to apply
    }

    params.push(id)
    const sql = `UPDATE files SET ${fields.join(', ')} WHERE id = ?`
    
    const stmt = this.db.prepare(sql)
    stmt.run(...params)
  }

  async delete(id: number): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM files WHERE id = ?')
    stmt.run(id)
  }

  private mapRowToFile(row: any): File {
    return {
      id: row.id,
      path: row.path,
      name: row.name,
      size: row.size,
      mimeType: row.mime_type,
      createdAt: row.created_at,
      modifiedAt: row.modified_at,
      hashXxh3: row.hash_xxh3,
      hashBlake3: row.hash_blake3,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }
  }
}