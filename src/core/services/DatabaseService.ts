import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import type { Migration, DatabaseConfig } from '../types'

// Configuration for database operations
const DATABASE_DEFAULTS = {
  pragmas: {
    'journal_mode': 'WAL',
    'synchronous': 'NORMAL', 
    'foreign_keys': 'ON',
    'busy_timeout': '5000'
  }
} as const

/**
 * Core database service - framework agnostic
 * Handles SQLite database operations, migrations, and vector extensions
 */
export class DatabaseService {
  private db: Database.Database | null = null
  private vectorSupport: boolean = false
  private config: DatabaseConfig

  constructor(config: DatabaseConfig = {}) {
    this.config = config
  }

  async initialize(dbPath?: string): Promise<void> {
    const finalDbPath = dbPath || this.config.dbPath
    if (!finalDbPath) {
      throw new Error('Database path must be provided either in constructor config or initialize method')
    }

    const dir = path.dirname(finalDbPath)
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    this.db = new Database(finalDbPath)
    
    // Configure SQLite for better performance and reliability
    this.configurePragmas()
    
    // Try to load vector extension
    this.vectorSupport = this.loadVectorExtension()
    
    this.runMigrations()
  }

  private configurePragmas(): void {
    if (!this.db) return

    Object.entries(DATABASE_DEFAULTS.pragmas).forEach(([key, value]) => {
      this.db!.pragma(`${key} = ${value}`)
    })
  }

  async close(): Promise<void> {
    if (this.db) {
      // Ensure WAL is flushed before closing
      this.db.pragma('wal_checkpoint(TRUNCATE)')
      this.db.close()
      this.db = null
    }
  }

  // Helper method to get default database path (requires Electron app to be initialized)
  static getDefaultDatabasePath(userDataPath: string): string {
    return path.join(userDataPath, 'rummage.db')
  }

  getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database has not been initialized')
    }
    return this.db
  }

  hasVectorSupport(): boolean {
    return this.vectorSupport
  }

  private loadVectorExtension(): boolean {
    if (!this.db) return false
    
    // Check if vector extension is disabled
    if (this.config.enableVectorExtension === false || 
        process.env.DISABLE_VECTOR_EXTENSION === 'true') {
      return false
    }
    
    // Try configured path first, then default name
    let extensionPath = this.config.vectorExtensionPath || 
                       process.env.SQLITE_VEC_PATH || 
                       'sqlite-vec'
    
    // Security: Validate extension path to prevent arbitrary file loading
    if (this.config.vectorExtensionPath || process.env.SQLITE_VEC_PATH) {
      // Only allow specific file extensions and no path traversal
      if (!extensionPath.match(/^[a-zA-Z0-9_\-./\\:]+\.(so|dylib|dll)$/)) {
        console.warn('Invalid extension path format, using default')
        extensionPath = 'sqlite-vec'
      }
    }
    
    try {
      this.db.loadExtension(extensionPath)
      console.log('sqlite-vec extension loaded successfully')
      return true
    } catch (error) {
      // Only log warning if explicitly trying to use vector features
      if (this.config.vectorExtensionPath || process.env.SQLITE_VEC_PATH) {
        console.warn('sqlite-vec extension not available:', (error as Error).message)
      }
      return false
    }
  }

  private runMigrations(): void {
    if (!this.db) return

    // Ensure meta table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `)

    const currentVersion = this.getCurrentVersion()
    const migrations = this.getMigrations()

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.name}`)
        this.executeMigration(migration)
        this.updateVersion(migration.version)
      }
    }
  }

  private getCurrentVersion(): number {
    if (!this.db) return 0
    
    const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('schema_version') as { value: string } | undefined
    return row ? parseInt(row.value, 10) : 0
  }

  private updateVersion(version: number): void {
    if (!this.db) return
    
    this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
      .run('schema_version', version.toString())
  }

  private getMigrations(): Migration[] {
    const migrations: Migration[] = [
      {
        version: 1,
        name: 'Initial schema',
        sql: `
          CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT
          );
        `
      },
      {
        version: 2,
        name: 'Create files table',
        sql: `
          CREATE TABLE files (
            id INTEGER PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            size INTEGER,
            mime_type TEXT,
            created_at INTEGER,
            modified_at INTEGER,
            hash_xxh3 TEXT,
            hash_blake3 TEXT,
            metadata JSON
          );
          CREATE INDEX idx_files_path ON files(path);
          CREATE INDEX idx_files_mime_type ON files(mime_type);
          CREATE INDEX idx_files_size ON files(size);
        `
      },
      {
        version: 3,
        name: 'Create scan_history table',
        sql: `
          CREATE TABLE scan_history (
            id INTEGER PRIMARY KEY,
            directory TEXT NOT NULL,
            started_at INTEGER,
            completed_at INTEGER,
            files_scanned INTEGER,
            status TEXT
          );
          CREATE INDEX idx_scan_history_directory ON scan_history(directory);
          CREATE INDEX idx_scan_history_status ON scan_history(status);
        `
      }
    ]

    // Add vector tables if extension is available
    if (this.vectorSupport) {
      migrations.push({
        version: 4,
        name: 'Create vector tables',
        sql: `
          CREATE VIRTUAL TABLE IF NOT EXISTS text_embeddings USING vec0(
            file_id INTEGER PRIMARY KEY,
            embedding FLOAT[384]
          );
          CREATE VIRTUAL TABLE IF NOT EXISTS image_embeddings USING vec0(
            file_id INTEGER PRIMARY KEY,
            embedding FLOAT[512]
          );
        `
      })
    }

    return migrations
  }

  private executeMigration(migration: Migration): void {
    if (!this.db) return
    
    try {
      // Execute the entire migration SQL in a single transaction
      // This is safer than splitting on semicolons which breaks on complex statements
      const runMigration = this.db.transaction(() => {
        this.db!.exec(migration.sql)
      })
      runMigration()
    } catch (error) {
      console.error(`Failed to execute migration ${migration.version}:`, error)
      throw error
    }
  }

  // Transaction support - enforces synchronous operations only
  withTransaction<T>(operation: (db: Database.Database) => T): T {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const transaction = this.db.transaction(operation)
    return transaction(this.db)
  }

  // Meta operations
  getMeta(key: string): string | null {
    if (!this.db) return null
    
    const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined
    return row?.value || null
  }

  setMeta(key: string, value: string): void {
    if (!this.db) return
    
    this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
      .run(key, value)
  }

  // Vector operations
  addTextEmbedding(fileId: number, embedding: Float32Array): void {
    if (!this.vectorSupport || !this.db) {
      console.warn('Vector operations not supported')
      return
    }

    const stmt = this.db.prepare('INSERT OR REPLACE INTO text_embeddings (file_id, embedding) VALUES (?, ?)')
    stmt.run(fileId, Array.from(embedding))
  }

  addImageEmbedding(fileId: number, embedding: Float32Array): void {
    if (!this.vectorSupport || !this.db) {
      console.warn('Vector operations not supported')
      return
    }

    const stmt = this.db.prepare('INSERT OR REPLACE INTO image_embeddings (file_id, embedding) VALUES (?, ?)')
    stmt.run(fileId, Array.from(embedding))
  }

  searchSimilarText(embedding: Float32Array, limit: number = 10): Array<{fileId: number, distance: number}> {
    if (!this.vectorSupport || !this.db) {
      console.warn('Vector search not supported')
      return []
    }

    try {
      // Use sqlite-vec similarity search with explicit column names
      const stmt = this.db.prepare(`
        SELECT file_id, distance 
        FROM text_embeddings 
        WHERE embedding MATCH ? 
        ORDER BY distance 
        LIMIT ?
      `)
      
      const results = stmt.all(Array.from(embedding), limit) as Array<{file_id: number, distance: number}>
      return results.map(row => ({ fileId: row.file_id, distance: row.distance }))
    } catch (error) {
      console.warn('Vector search failed:', error)
      return []
    }
  }

  searchSimilarImages(embedding: Float32Array, limit: number = 10): Array<{fileId: number, distance: number}> {
    if (!this.vectorSupport || !this.db) {
      console.warn('Vector search not supported')
      return []
    }

    try {
      const stmt = this.db.prepare(`
        SELECT file_id, distance 
        FROM image_embeddings 
        WHERE embedding MATCH ? 
        ORDER BY distance 
        LIMIT ?
      `)
      
      const results = stmt.all(Array.from(embedding), limit) as Array<{file_id: number, distance: number}>
      return results.map(row => ({ fileId: row.file_id, distance: row.distance }))
    } catch (error) {
      console.warn('Vector search failed:', error)
      return []
    }
  }

  removeEmbeddings(fileId: number): void {
    if (!this.vectorSupport || !this.db) {
      return
    }

    try {
      this.db.prepare('DELETE FROM text_embeddings WHERE file_id = ?').run(fileId)
      this.db.prepare('DELETE FROM image_embeddings WHERE file_id = ?').run(fileId)
    } catch (error) {
      console.warn('Failed to remove embeddings:', error)
    }
  }
}