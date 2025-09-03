import type { Migration } from '../types'

export const DEFAULT_MIGRATIONS: Migration[] = [
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

export const VECTOR_MIGRATIONS: Migration[] = [
  {
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
  }
]

export const DATABASE_DEFAULTS = {
  pragmas: {
    'journal_mode': 'WAL',
    'synchronous': 'NORMAL',
    'foreign_keys': 'ON',
    'busy_timeout': '5000'
  }
} as const