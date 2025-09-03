import Database from 'better-sqlite3'

export const createTestDatabase = async () => {
  const db = new Database(':memory:')
  
  // Create basic meta table like the real database
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)
  
  // Set schema version
  db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run('schema_version', '1')
  
  return db
}

export const createTestDatabaseWithTables = async () => {
  const db = await createTestDatabase()
  
  // Create files table for testing
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
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
  `)
  
  // Create scan_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY,
      directory TEXT NOT NULL,
      started_at INTEGER,
      completed_at INTEGER,
      files_scanned INTEGER,
      status TEXT
    );
  `)
  
  return db
}

export const seedTestData = (db: Database.Database) => {
  const insertFile = db.prepare(`
    INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  insertFile.run(
    '/test/image.png', 'image.png', 1024, 'image/png', 
    1630000000, 1630000000, 'abc123', JSON.stringify({width: 100, height: 100})
  )
  
  insertFile.run(
    '/test/doc.pdf', 'doc.pdf', 2048, 'application/pdf',
    1630000000, 1630000000, 'def456', JSON.stringify({})
  )
}