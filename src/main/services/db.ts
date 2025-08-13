import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

let dbInstance: Database.Database | null = null

export function getDatabasePath(userDataDir: string): string {
    return path.join(userDataDir, 'rummage.db')
}

export function initializeDatabase(dbFilePath: string): Database.Database {
    const dir = path.dirname(dbFilePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    const db = new Database(dbFilePath)
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')

    db.exec(
        `CREATE TABLE IF NOT EXISTS meta (
       key TEXT PRIMARY KEY,
       value TEXT
     );`
    )

    // set a simple schema version
    const setVersion = db.prepare('INSERT INTO meta(key,value) VALUES(@key,@value) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    setVersion.run({ key: 'schema_version', value: '1' })

    dbInstance = db
    return db
}

export function getDb(): Database.Database {
    if (!dbInstance) {
        throw new Error('Database has not been initialized')
    }
    return dbInstance
}

export function getMeta(key: string): string | null {
    const db = getDb()
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined
    return row?.value ?? null
}

export function setMeta(key: string, value: string): void {
    const db = getDb()
    db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value)
}


