# IPC API Documentation

## Overview

The IPC API provides secure communication between the Electron main and renderer processes. All operations use typed channels and include proper input validation and error handling.

## File System Operations

### `selectDirectory()`
**Channel:** `fs:select-directory`  
**Purpose:** Open native directory selection dialog  
**Returns:** `Promise<string | null>` - Selected directory path or null if cancelled  
**Usage:** User directory selection for scanning  

### `scanDirectory(request: ScanDirectoryRequest)`
**Channel:** `fs:scan-directory`  
**Purpose:** Recursively scan directory and extract file metadata  
**Parameters:**
- `request.path` (string) - Absolute directory path to scan
- `request.options` (optional) - Scan options (reserved for future use)

**Returns:** `Promise<ScanResult>`
```typescript
interface ScanResult {
  success: boolean
  scanId: number
  filesFound: number
  duration: number
  error?: string
}
```

**Events Emitted:**
- `scan:started` - Scan begins
- `scan:progress` - Progress updates (throttled to every 10 files)
- `scan:completed` - Scan finished successfully
- `scan:cancelled` - Scan was cancelled
- `scan:error` - Scan failed with error

### `cancelScan()`
**Channel:** `fs:cancel-scan`  
**Purpose:** Cancel all active directory scans  
**Returns:** `Promise<void>`  
**Effect:** Aborts all running scans and emits cancellation events  

## Database Operations

### `searchFiles(criteria: SearchCriteria)`
**Channel:** `db:search-files`  
**Purpose:** Search files by various criteria  
**Parameters:**
```typescript
interface SearchCriteria {
  mimeTypes?: string[]    // Filter by MIME types
  sizeMin?: number        // Minimum file size
  sizeMax?: number        // Maximum file size
  dateRange?: {           // Date range filter
    start: number
    end: number
  }
  textQuery?: string      // Text search (future)
  limit?: number          // Result limit
  offset?: number         // Pagination offset
}
```
**Returns:** `Promise<File[]>` - Array of matching files  

### `getFileMetadata(fileId: number)`
**Channel:** `db:get-file-metadata`  
**Purpose:** Get detailed metadata for specific file  
**Parameters:** File ID from database  
**Returns:** `Promise<FileMetadata | null>` - Detailed file metadata or null if not found  

### `getScanHistory()`
**Channel:** `db:get-scan-history`  
**Purpose:** Retrieve recent scan history  
**Returns:** `Promise<ScanHistory[]>` - Array of recent scans (limited to 10)  

## Vector Search Operations

### `searchSimilarImages(embedding: Float32Array, limit?: number)`
**Channel:** `vector:search-images`  
**Purpose:** Find visually similar images  
**Parameters:**
- `embedding` - 512-dimensional image embedding (CLIP format)
- `limit` - Maximum results (default: 10)

**Returns:** `Promise<SimilarityResult[]>` - Similar images with distances  

### `searchSimilarText(embedding: Float32Array, limit?: number)`
**Channel:** `vector:search-text`  
**Purpose:** Find semantically similar text content  
**Parameters:**
- `embedding` - 384-dimensional text embedding (MiniLM format)
- `limit` - Maximum results (default: 10)

**Returns:** `Promise<SimilarityResult[]>` - Similar text files with distances  

## Application Controls

### `getAppVersion()`
**Channel:** `app:get-version`  
**Purpose:** Get current application version  
**Returns:** `Promise<string>` - Version string  

### `minimizeWindow()` / `maximizeWindow()` / `closeWindow()`
**Channels:** `app:minimize`, `app:maximize`, `app:close`  
**Purpose:** Window control operations  
**Returns:** `Promise<void>`  

## Core Data Types

### File
```typescript
interface File {
  id: number
  path: string
  name: string
  size: number
  mimeType: string
  createdAt: number      // Unix timestamp
  modifiedAt: number     // Unix timestamp
  hashMd5?: string       // MD5 hash for deduplication
  metadata: {
    extension: string
    isImage: boolean
    isDocument: boolean
    permissions: number
  }
}
```

### FileMetadata (Extended)
```typescript
interface FileMetadata extends File {
  detailedStats?: {
    mode: number
    nlink: number
    uid: number
    gid: number
    // ... additional filesystem stats
  }
}
```

### ScanProgress Events
```typescript
interface ScanProgressEvent {
  scanId: number
  current: number        // Files processed
  total: number         // Total files found
  currentFile: string   // Current file being processed
}
```

## Security Notes

- All file system operations are sandboxed to user-selected directories
- Input validation prevents directory traversal attacks
- File access errors are handled gracefully without exposing sensitive paths
- Hash calculation is skipped for files larger than 50MB to prevent performance issues
- Hidden directories and common ignore patterns (.git, node_modules) are automatically skipped

## Error Handling

All IPC handlers implement consistent error handling:
- Input validation with descriptive error messages
- Graceful handling of file access errors
- Progress event cleanup on cancellation
- Sanitized error messages (no sensitive information exposure)

## Performance Considerations

- Directory scanning uses AbortController for cancellation
- Progress events are throttled (every 10 files) to prevent UI flooding
- Large files (>50MB) skip hash calculation
- Database operations use batch inserts for efficiency
- File metadata extraction is optimized for common file types