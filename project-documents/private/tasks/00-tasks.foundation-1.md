---
slice_name: foundation-1
project: rummage
lld_reference: project-documents/private/slices/00-slice.foundation.md
dependencies: []
estimated_effort: 5-7 days
phase: "Phase 6: Slice Execution"
created: 2025-08-30
lastUpdated: 2025-08-31
status: ready_for_execution
---

## Context Summary

The foundation slice establishes the core infrastructure for the Rummage application, including Electron setup, testing framework, database layer with vector search, IPC architecture, and minimal UI shell. This slice enables all subsequent feature development with a strong emphasis on Test-Driven Development.

**Key Technical Stack:**

- Electron with secure IPC architecture
- SQLite with sqlite-vec extension for vector storage
- Vitest testing framework with separate main/renderer configs
- React UI with Radix UI primitives
- TypeScript throughout

**Success Criteria:**

- Electron app starts and shows minimal UI
- Can select and scan a directory
- Files stored in SQLite with vector capabilities
- Bidirectional IPC communication working
- > 80% test coverage achieved
- Cross-platform compatibility (Windows, macOS, Linux)

## Granular Tasks

### Day 1: Testing Infrastructure Setup

#### Install and Configure Vitest Environment

- [x] Install core Vitest dependencies

  - [x] Install Vitest packages
    1. Run:
       ```bash
       npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node
       ```
  - [x] Verify installation completed without errors
  - [x] Success: All testing dependencies installed

- [x] Create main process test configuration

  - [x] Create `vitest.config.main.ts` file

    1. Add configuration for Node.js environment:

       ```typescript
       import { defineConfig } from "vitest/config";

       export default defineConfig({
         test: {
           name: "main",
           root: "./src/main",
           environment: "node",
           setupFiles: ["../tests/setup-main.ts"],
           coverage: {
             reporter: ["text", "json", "html"],
             exclude: ["node_modules/", "src/tests/", "**/*.test.ts"],
           },
           testTimeout: 10000,
         },
       });
       ```

  - [x] Success: Main process test config created

- [x] Create renderer process test configuration

  - [x] Create `vitest.config.renderer.ts` file

    1. Add configuration for jsdom environment:

       ```typescript
       import { defineConfig } from "vitest/config";

       export default defineConfig({
         test: {
           name: "renderer",
           root: "./src/renderer",
           environment: "jsdom",
           setupFiles: ["../tests/setup-renderer.ts"],
           coverage: {
             reporter: ["text", "json", "html"],
             exclude: ["node_modules/", "src/tests/", "**/*.test.tsx"],
           },
         },
       });
       ```

  - [x] Success: Renderer process test config created

- [x] Configure test scripts in package.json
  - [x] Add test scripts to package.json
    1. Add the following scripts:
       ```json
       {
         "scripts": {
           "test": "pnpm run test:main && pnpm run test:renderer",
           "test:main": "vitest --config vitest.config.main.ts",
           "test:renderer": "vitest --config vitest.config.renderer.ts",
           "test:coverage": "pnpm run test -- --coverage",
           "test:ui": "vitest --ui"
         }
       }
       ```
  - [x] Verify `pnpm test` command runs both configurations
  - [x] Success: Test scripts working correctly

#### Create Mock Utilities and Test Infrastructure

- [x] Create mock IPC bridge implementation

  - [x] Create `src/tests/helpers/mockIpc.ts` file
    1. Implement mock IPC methods:
       ```typescript
       export const createMockIpc = () => ({
         scanDirectory: vi.fn(),
         getFileMetadata: vi.fn(),
         searchFiles: vi.fn(),
         onScanProgress: vi.fn(),
         onScanComplete: vi.fn(),
         onError: vi.fn(),
       });
       ```
  - [x] Add TypeScript interface matching real IPC API
  - [x] Success: Mock IPC bridge created with all expected methods

- [x] Create mock file system service

  - [x] Create `src/tests/helpers/mockFs.ts` file
    1. Implement file system operations:
       ```typescript
       export class MockFileSystemService {
         async scanDirectory(path: string): Promise<FileInfo[]> {
           // Return fixture data based on path
         }
         async getFileMetadata(path: string): Promise<FileMetadata> {
           // Return mock metadata
         }
       }
       ```
  - [x] Add fixture data loading capabilities
  - [x] Success: Mock file system service supports fixture data

- [x] Create mock database service

  - [x] Create `src/tests/helpers/testDatabase.ts` file

    1. Set up in-memory SQLite database:

       ```typescript
       import Database from "better-sqlite3";

       export const createTestDatabase = async () => {
         const db = new Database(":memory:");
         await runMigrations(db);
         return db;
       };
       ```

  - [x] Add database seeding utilities
  - [x] Success: In-memory database setup working

- [x] Create test builder utilities
  - [x] Create `src/tests/helpers/testBuilder.ts` file
    1. Implement builder patterns:
       ```typescript
       export const fileBuilder = () => ({
         withPath: (path: string) => this,
         withSize: (size: number) => this,
         withMimeType: (type: string) => this,
         build: (): FileInfo => ({}),
       });
       ```
  - [x] Add builders for all major data types
  - [x] Success: Builder pattern utilities created

#### Set Up Test Fixtures and Sample Data

- [x] Create fixture directory structure

  - [x] Create `src/tests/fixtures/` directory
  - [x] Create subdirectories: `sample-images/`, `sample-docs/`, `sample-code/`
  - [x] Success: Fixture directory structure created

- [x] Add sample files for testing

  - [x] Add sample images
    1. Create small PNG files (100x100px)
    2. Create small JPG files (100x100px)
    3. Include images with EXIF data for metadata testing
  - [x] Add sample documents
    1. Create sample PDF file
    2. Create sample TXT files with known content
    3. Create sample markdown files
  - [x] Add sample code files
    1. Create TypeScript files
    2. Create JavaScript files
    3. Create JSON configuration files
  - [x] Success: Sample files covering all target types created

- [x] Create test database fixtures

  - [x] Create `src/tests/fixtures/test-db.sql` file
    1. Add sample file records:
       ```sql
       INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3)
       VALUES
       ('/test/image.png', 'image.png', 1024, 'image/png', 1630000000, 1630000000, 'abc123'),
       ('/test/doc.pdf', 'doc.pdf', 2048, 'application/pdf', 1630000000, 1630000000, 'def456');
       ```
  - [x] Add sample scan history records
  - [x] Success: Test database fixtures created

- [x] Create fixture loading utilities
  - [x] Create `src/tests/helpers/fixtureLoader.ts` file
    1. Add fixture path resolution:
       ```typescript
       export const getFixturePath = (filename: string) =>
         path.join(__dirname, "../fixtures", filename);
       ```
  - [x] Add fixture file loading utilities
  - [x] Success: Fixture loading helpers created

### Day 2: Database Layer Implementation

#### Expand Database Service with Core Tables

- [x] Create enhanced database service class

  - [x] Create `src/main/services/DatabaseService.ts` class

    1. Expand beyond basic meta table functionality:

       ```typescript
       export class DatabaseService {
         private db: Database.Database | null = null;

         async initialize(dbPath: string): Promise<void> {
           this.db = new Database(dbPath);
           this.db.pragma("journal_mode = WAL");
           this.db.pragma("synchronous = NORMAL");
           await this.runMigrations();
         }

         private async runMigrations(): Promise<void> {
           // Migration system with version tracking
         }
       }
       ```

  - [x] Add proper error handling and connection lifecycle
  - [x] Success: Enhanced DatabaseService class created

- [x] Implement migration system with version tracking

  - [x] Create migration infrastructure

    1. Add migration tracking and execution:

       ```typescript
       private async runMigrations(): Promise<void> {
         const currentVersion = this.getCurrentVersion()
         const migrations = this.getMigrations()

         for (const migration of migrations) {
           if (migration.version > currentVersion) {
             await this.executeMigration(migration)
             this.updateVersion(migration.version)
           }
         }
       }
       ```

  - [x] Define migration structure and versioning
  - [x] Success: Migration system implemented

- [x] Create core table schemas
  - [x] Create files table migration
    1. Add files table schema:
       ```sql
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
       ```
  - [x] Create scan_history table migration
    1. Add scan_history schema:
       ```sql
       CREATE TABLE scan_history (
         id INTEGER PRIMARY KEY,
         directory TEXT NOT NULL,
         started_at INTEGER,
         completed_at INTEGER,
         files_scanned INTEGER,
         status TEXT
       );
       CREATE INDEX idx_scan_history_directory ON scan_history(directory);
       ```
  - [x] Success: Core tables created with proper indexing

#### Integrate sqlite-vec Vector Extension

- [x] Configure sqlite-vec extension loading

  - [x] Add vector extension initialization
    1. Implement extension loading with fallback:
       ```typescript
       private loadVectorExtension(): boolean {
         try {
           // Try to load sqlite-vec extension
           this.db.loadExtension('sqlite-vec')
           console.log('sqlite-vec extension loaded successfully')
           return true
         } catch (error) {
           console.warn('sqlite-vec extension not available:', error.message)
           return false
         }
       }
       ```
  - [x] Implement fallback strategy for missing extension
  - [x] Success: Vector extension loading with fallback implemented

- [x] Create vector storage tables

  - [x] Create text embeddings virtual table
    1. Add text embeddings table:
       ```sql
       CREATE VIRTUAL TABLE IF NOT EXISTS text_embeddings USING vec0(
         file_id INTEGER PRIMARY KEY,
         embedding FLOAT[384]  -- MiniLM dimension
       );
       ```
  - [x] Create image embeddings virtual table
    1. Add image embeddings table:
       ```sql
       CREATE VIRTUAL TABLE IF NOT EXISTS image_embeddings USING vec0(
         file_id INTEGER PRIMARY KEY,
         embedding FLOAT[512]  -- CLIP dimension
       );
       ```
  - [x] Success: Vector tables created successfully

- [x] Implement basic vector operations
  - [x] Add vector insertion methods
    1. Implement vector storage operations:
       ```typescript
       async addTextEmbedding(fileId: number, embedding: Float32Array): Promise<void> {
         if (!this.vectorSupport) {
           console.warn('Vector operations not supported')
           return
         }
         const stmt = this.db.prepare('INSERT INTO text_embeddings VALUES (?, ?)')
         stmt.run(fileId, Array.from(embedding))
       }
       ```
  - [x] Add vector similarity search methods
  - [x] Add vector deletion and update methods
  - [x] Success: Basic vector operations implemented

#### Implement Repository Pattern and Data Access Layer

- [x] Define repository interfaces

  - [x] Create `src/shared/types/repositories.ts` file
    1. Define FileRepository interface:
       ```typescript
       export interface FileRepository {
         findById(id: number): Promise<File | null>;
         findByPath(path: string): Promise<File | null>;
         search(criteria: SearchCriteria): Promise<File[]>;
         insert(file: FileInfo): Promise<number>;
         update(id: number, updates: Partial<File>): Promise<void>;
         delete(id: number): Promise<void>;
       }
       ```
  - [x] Define VectorStore interface
    1. Define VectorStore interface:
       ```typescript
       export interface VectorStore {
         addTextEmbedding(
           fileId: number,
           embedding: Float32Array
         ): Promise<void>;
         addImageEmbedding(
           fileId: number,
           embedding: Float32Array
         ): Promise<void>;
         searchSimilar(
           embedding: Float32Array,
           limit: number
         ): Promise<SimilarityResult[]>;
         removeEmbeddings(fileId: number): Promise<void>;
       }
       ```
  - [x] Success: Repository interfaces defined

- [x] Implement FileRepository

  - [x] Create `src/main/repositories/FileRepository.ts` file

    1. Implement CRUD operations:

       ```typescript
       export class FileRepository implements IFileRepository {
         constructor(private db: Database.Database) {}

         async insert(file: FileInfo): Promise<number> {
           const stmt = this.db.prepare(`
             INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, hash_blake3, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           `);
           const result = stmt.run(
             file.path,
             file.name,
             file.size,
             file.mimeType,
             file.createdAt,
             file.modifiedAt,
             file.hashXxh3,
             file.hashBlake3,
             JSON.stringify(file.metadata)
           );
           return result.lastInsertRowid as number;
         }

         async findByPath(path: string): Promise<File | null> {
           const stmt = this.db.prepare("SELECT * FROM files WHERE path = ?");
           const row = stmt.get(path) as any;
           return row ? this.mapRowToFile(row) : null;
         }
       }
       ```

  - [x] Add search and query methods with filtering
  - [x] Add batch operations for performance
  - [x] Success: FileRepository fully implemented

- [x] Implement VectorStore

  - [x] Create `src/main/repositories/VectorStore.ts` file

    1. Implement vector storage operations:

       ```typescript
       export class VectorStore implements IVectorStore {
         constructor(
           private db: Database.Database,
           private vectorSupport: boolean
         ) {}

         async addTextEmbedding(
           fileId: number,
           embedding: Float32Array
         ): Promise<void> {
           if (!this.vectorSupport) return;

           const stmt = this.db.prepare(
             "INSERT OR REPLACE INTO text_embeddings VALUES (?, ?)"
           );
           stmt.run(fileId, Array.from(embedding));
         }

         async searchSimilar(
           embedding: Float32Array,
           limit: number = 10
         ): Promise<SimilarityResult[]> {
           if (!this.vectorSupport) return [];

           // Implement similarity search using sqlite-vec
         }
       }
       ```

  - [x] Implement similarity search algorithms
  - [x] Add embedding management (update, delete)
  - [x] Success: VectorStore implementation complete

- [x] Create ScanHistoryRepository

  - [x] Create `src/main/repositories/ScanHistoryRepository.ts` file

    1. Implement CRUD operations for scan tracking:

       ```typescript
       export class ScanHistoryRepository implements IScanHistoryRepository {
         constructor(private db: Database.Database) {}

         async create(directory: string): Promise<number> {
           const stmt = this.db.prepare(`
             INSERT INTO scan_history (directory, started_at, files_scanned, status)
             VALUES (?, ?, 0, 'running')
           `);
           const result = stmt.run(directory, Date.now());
           return result.lastInsertRowid as number;
         }
       }
       ```

  - [x] Success: ScanHistoryRepository implemented

- [x] Create RepositoryService for centralized management

  - [x] Create `src/main/services/RepositoryService.ts` file
    1. Implement repository factory and convenience methods:
       ```typescript
       export class RepositoryService {
         constructor(db: Database, vectorSupport: boolean) {
           this.fileRepository = new FileRepository(db);
           this.vectorStore = new VectorStore(db, vectorSupport);
           this.scanHistoryRepository = new ScanHistoryRepository(db);
         }
       }
       ```
  - [x] Success: RepositoryService created

- [x] Add transaction support
  - [x] Implement transaction wrapper utility
    1. Add transaction support:
       ```typescript
       async withTransaction<T>(operation: (db: Database.Database) => Promise<T>): Promise<T> {
         const transaction = this.db.transaction((op) => op())
         try {
           return await transaction(operation)
         } catch (error) {
           // Transaction automatically rolls back on error
           throw error
         }
       }
       ```
  - [x] Update repository methods to support transactions
  - [x] Add batch processing with transactions
  - [x] Success: Transaction support implemented
