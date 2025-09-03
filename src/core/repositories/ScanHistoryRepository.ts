import Database from 'better-sqlite3'
import type { ScanHistory, ScanHistoryRepository as IScanHistoryRepository } from '../types'

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

  async update(id: number, updates: Partial<ScanHistory>): Promise<void> {
    const fields: string[] = []
    const params: any[] = []

    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?')
      params.push(updates.completedAt)
    }

    if (updates.filesScanned !== undefined) {
      fields.push('files_scanned = ?')
      params.push(updates.filesScanned)
    }

    if (updates.status !== undefined) {
      fields.push('status = ?')
      params.push(updates.status)
    }

    if (fields.length === 0) {
      return // No updates to apply
    }

    params.push(id)
    const sql = `UPDATE scan_history SET ${fields.join(', ')} WHERE id = ?`
    
    const stmt = this.db.prepare(sql)
    stmt.run(...params)
  }

  async findByDirectory(directory: string): Promise<ScanHistory[]> {
    const stmt = this.db.prepare('SELECT * FROM scan_history WHERE directory = ? ORDER BY started_at DESC')
    const rows = stmt.all(directory) as any[]
    return rows.map(row => this.mapRowToScanHistory(row))
  }

  async getRecent(limit: number = 10): Promise<ScanHistory[]> {
    const stmt = this.db.prepare('SELECT * FROM scan_history ORDER BY started_at DESC LIMIT ?')
    const rows = stmt.all(limit) as any[]
    return rows.map(row => this.mapRowToScanHistory(row))
  }

  private mapRowToScanHistory(row: any): ScanHistory {
    return {
      id: row.id,
      directory: row.directory,
      startedAt: row.started_at,
      completedAt: row.completed_at || undefined,
      filesScanned: row.files_scanned,
      status: row.status as 'running' | 'completed' | 'failed' | 'cancelled'
    }
  }
}