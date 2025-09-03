# Slice Design: Foundation
**Project:** Rummage  
**Slice:** foundation  
**Type:** Infrastructure/Setup  
**Estimated Effort:** 5-7 days  
**Dependencies:** None (this is the base layer)

## Overview
The foundation slice establishes the core infrastructure for the Rummage application, including Electron setup, testing framework, database layer with vector search, IPC architecture, and minimal UI shell. This slice enables all subsequent feature development with a strong emphasis on Test-Driven Development.

## Technical Decisions

### Testing Strategy (TDD-First)
- **Framework:** Vitest with separate configurations for main/renderer
- **Test Doubles:** Mock implementations for file system, IPC, and database
- **Coverage Target:** 80% for business logic, 60% for UI components
- **Test Data:** Fixtures directory with sample files, images, and documents

### Electron Architecture
- **Process Model:** 
  - Main process: File operations, database, AI inference
  - Renderer process: React UI, user interactions
  - Preload script: Secure context bridge
- **IPC Security:**
  - Context isolation enabled
  - Node integration disabled in renderer
  - Whitelist-based IPC channels

### Database Design
- **SQLite Configuration:**
  ```sql
  -- Core tables
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
  
  CREATE TABLE scan_history (
    id INTEGER PRIMARY KEY,
    directory TEXT NOT NULL,
    started_at INTEGER,
    completed_at INTEGER,
    files_scanned INTEGER,
    status TEXT
  );
  ```

- **Vector Storage (sqlite-vec):**
  ```sql
  -- Vector tables for embeddings
  CREATE VIRTUAL TABLE text_embeddings USING vec0(
    file_id INTEGER PRIMARY KEY,
    embedding FLOAT[384]  -- MiniLM dimension
  );
  
  CREATE VIRTUAL TABLE image_embeddings USING vec0(
    file_id INTEGER PRIMARY KEY,
    embedding FLOAT[512]  -- CLIP dimension
  );
  ```

### UI Architecture
- **Component Library:** Radix UI primitives (unstyled, accessible)
- **Styling:** Minimal inline styles, CSS modules for isolation
- **State Management:** React Context for global state
- **Component Structure:**
  ```
  src/renderer/
  ├── components/
  │   ├── common/       # Shared primitives
  │   ├── layout/       # App shell, navigation
  │   └── features/     # Feature-specific (empty for now)
  ├── contexts/         # React contexts
  └── hooks/           # Custom React hooks
  ```

## Component Interactions

### IPC Communication Flow
```typescript
// Renderer → Main (via preload)
interface IpcApi {
  // File operations
  scanDirectory(path: string): Promise<ScanResult>
  getFileMetadata(fileId: number): Promise<FileMetadata>
  
  // Database operations  
  searchFiles(query: SearchQuery): Promise<SearchResult[]>
  
  // Progress events
  onScanProgress(callback: (progress: ScanProgress) => void): void
}

// Main → Renderer (events)
interface IpcEvents {
  'scan:progress': ScanProgress
  'scan:complete': ScanResult
  'error': ErrorInfo
}
```

### Service Layer Architecture
```typescript
// Main process services
class DatabaseService {
  private db: Database
  private vectorStore: VectorStore
  
  async initialize(): Promise<void>
  async close(): Promise<void>
  async insertFile(file: FileInfo): Promise<number>
  async searchVectors(embedding: Float32Array): Promise<SearchResult[]>
}

class FileSystemService {
  async scanDirectory(path: string): Promise<FileInfo[]>
  async getFileMetadata(path: string): Promise<FileMetadata>
  async calculateHash(path: string): Promise<FileHash>
}

class IpcService {
  constructor(
    private dbService: DatabaseService,
    private fsService: FileSystemService
  )
  
  registerHandlers(): void
  sendProgress(channel: string, data: any): void
}
```

## Testing Infrastructure Details

### Test Organization
```
src/
├── main/
│   ├── services/
│   │   ├── DatabaseService.ts
│   │   ├── DatabaseService.test.ts
│   │   └── __mocks__/
│   │       └── DatabaseService.ts
├── renderer/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   └── AppShell.test.tsx
└── tests/
    ├── fixtures/
    │   ├── sample-images/
    │   ├── sample-docs/
    │   └── test-db.sql
    ├── helpers/
    │   ├── mockIpc.ts
    │   ├── mockFs.ts
    │   └── testBuilder.ts
    └── integration/
        └── foundation.test.ts
```

### Test Utilities
```typescript
// Test builders for consistent test data
export const fileBuilder = () => ({
  withPath: (path: string) => {...},
  withSize: (size: number) => {...},
  withMimeType: (type: string) => {...},
  build: (): FileInfo => {...}
})

// Mock IPC for renderer tests
export const createMockIpc = () => ({
  scanDirectory: vi.fn(),
  onScanProgress: vi.fn(),
  // ...
})

// In-memory database for tests
export const createTestDatabase = async () => {
  const db = new Database(':memory:')
  await runMigrations(db)
  return db
}
```

## Data Flow Specifications

### Directory Scanning Flow
1. User initiates scan via UI
2. Renderer sends IPC message to main
3. Main process:
   - Validates directory path
   - Starts recursive file discovery
   - Extracts metadata for each file
   - Calculates hashes (batched)
   - Inserts into database (transactional)
   - Sends progress updates
4. Renderer updates UI with progress
5. Completion notification sent

### Database Query Flow
1. Search request from UI
2. Query builder constructs SQL
3. Vector search if applicable
4. Results merged and ranked
5. Paginated response returned
6. UI renders results

## Cross-Slice Interfaces

### Exports for Feature Slices
```typescript
// Database repository pattern
export interface FileRepository {
  findById(id: number): Promise<File>
  findByPath(path: string): Promise<File>
  search(criteria: SearchCriteria): Promise<File[]>
  insert(file: FileInfo): Promise<number>
  update(id: number, updates: Partial<File>): Promise<void>
}

// Event emitter for progress
export interface ProgressEmitter extends EventEmitter {
  emitProgress(current: number, total: number): void
  emitComplete(result: any): void
  emitError(error: Error): void
}

// Vector operations
export interface VectorStore {
  addTextEmbedding(fileId: number, embedding: Float32Array): Promise<void>
  addImageEmbedding(fileId: number, embedding: Float32Array): Promise<void>
  searchSimilar(embedding: Float32Array, limit: number): Promise<SimilarityResult[]>
}
```

## UI Mockups

### Minimal App Shell
```
┌─────────────────────────────────────────────────┐
│ Rummage                                    [−][□][×]│
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │                                               │ │
│ │           Welcome to Rummage                  │ │
│ │                                               │ │
│ │     [Select Directory to Scan]                │ │
│ │                                               │ │
│ │     Recent Scans:                             │ │
│ │     • /Users/me/Photos (15,234 files)         │ │
│ │     • /Users/me/Downloads (892 files)         │ │
│ │                                               │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Status: Ready                                    │
└─────────────────────────────────────────────────┘
```

### Scan Progress View
```
┌─────────────────────────────────────────────────┐
│ Scanning: /Users/me/Photos                       │
├─────────────────────────────────────────────────┤
│                                                   │
│  Progress: ████████████░░░░░░░░  62%             │
│                                                   │
│  Files discovered: 9,425                         │
│  Current: IMG_2024_0823.jpg                      │
│                                                   │
│  [Cancel]                                         │
│                                                   │
└─────────────────────────────────────────────────┘
```

## Risk Mitigation

### Identified Risks
1. **SQLite vec extension compatibility**
   - Mitigation: Test on all platforms early
   - Fallback: Pure JS vector search if needed

2. **Electron IPC performance with large datasets**
   - Mitigation: Implement streaming/pagination
   - Fallback: Batch processing with progress

3. **Testing complexity with Electron**
   - Mitigation: Separate business logic from Electron APIs
   - Fallback: More integration tests if unit tests prove difficult

## Implementation Notes

### Development Order
1. **Testing Setup** (Day 1)
   - Configure Vitest environments
   - Create mock utilities
   - Set up test fixtures

2. **Database Layer** (Day 2)
   - SQLite initialization
   - Migration system
   - Repository pattern implementation
   - sqlite-vec integration

3. **IPC Architecture** (Day 3)
   - Define channel protocols
   - Implement handlers
   - Create type-safe bridge

4. **File System Service** (Day 4)
   - Directory scanning
   - Metadata extraction
   - Hash calculation

5. **Minimal UI Shell** (Day 5)
   - Basic layout components
   - Directory picker
   - Progress display

6. **Integration & Testing** (Day 6-7)
   - End-to-end tests
   - Performance validation
   - Cross-platform testing

### TDD Checkpoints
- [ ] Test utilities and mocks created
- [ ] Database operations have 100% test coverage
- [ ] IPC handlers tested with mocks
- [ ] File service tested with fixture data
- [ ] UI components tested with React Testing Library
- [ ] Integration tests pass on all platforms

## Success Criteria
- [ ] Electron app starts and shows minimal UI
- [ ] Can select and scan a directory
- [ ] Files are stored in SQLite database
- [ ] Vector extension loads successfully
- [ ] IPC communication works bidirectionally
- [ ] All tests pass with >80% coverage
- [ ] No TypeScript errors
- [ ] Works on Windows, macOS, Linux

## Dependencies for Next Slices
This foundation provides:
- Database connection and repositories
- IPC communication channels
- File system operations
- Testing infrastructure
- Basic UI shell

Feature slices can build upon these without reimplementing core infrastructure.

## Open Questions
1. Should we implement hot-reload for development?
2. Do we need a logging system in foundation?
3. Should we add telemetry/analytics (privacy-preserving)?

These can be addressed during implementation or deferred to integration phase.