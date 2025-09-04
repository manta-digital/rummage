/**
 * Standardized IPC channel names with security boundaries
 * 
 * Security Notes:
 * - All channels use namespaced prefixes for organization
 * - File system operations are sandboxed to user-selected directories
 * - Database operations are read-only except for scan results
 * - Vector operations require valid file IDs to prevent data leakage
 * - Application operations are limited to window controls
 */

export const IPC_CHANNELS = {
  // File System Channels - Handle directory selection and scanning
  SELECT_DIRECTORY: 'fs:select-directory',
  SCAN_DIRECTORY: 'fs:scan-directory', 
  CANCEL_SCAN: 'fs:cancel-scan',
  
  // Database Channels - Core data operations
  SEARCH_FILES: 'db:search-files',
  GET_FILE_METADATA: 'db:get-file-metadata',
  GET_SCAN_HISTORY: 'db:get-scan-history',
  GET_SCHEMA_VERSION: 'db:getSchemaVersion',
  SET_META: 'db:setMeta',
  HAS_VECTOR_SUPPORT: 'db:hasVectorSupport',
  
  // File Repository Channels - Individual file operations
  FILES_FIND_BY_ID: 'files:findById',
  FILES_FIND_BY_PATH: 'files:findByPath', 
  FILES_SEARCH: 'files:search',
  FILES_INSERT: 'files:insert',
  FILES_UPDATE: 'files:update',
  FILES_DELETE: 'files:delete',
  FILES_GET_ALL: 'files:getAll',
  
  // Vector Search Channels - AI/ML operations
  VECTOR_SEARCH_SIMILAR_IMAGES: 'vector:search-images',
  VECTOR_SEARCH_SIMILAR_TEXT: 'vector:search-text',
  VECTOR_ADD_TEXT_EMBEDDING: 'vector:add-text-embedding',
  VECTOR_ADD_IMAGE_EMBEDDING: 'vector:add-image-embedding',
  VECTOR_REMOVE_EMBEDDINGS: 'vector:remove-embeddings',
  
  // Scan History Channels - Track scanning operations
  SCAN_HISTORY_CREATE: 'scanHistory:create',
  SCAN_HISTORY_UPDATE: 'scanHistory:update', 
  SCAN_HISTORY_FIND_BY_DIRECTORY: 'scanHistory:findByDirectory',
  SCAN_HISTORY_GET_RECENT: 'scanHistory:getRecent',
  
  // Application Channels - Window and app controls
  GET_APP_VERSION: 'app:get-version',
  MINIMIZE_WINDOW: 'app:minimize',
  MAXIMIZE_WINDOW: 'app:maximize',
  CLOSE_WINDOW: 'app:close',
  
  // Basic connectivity
  PING: 'ping'
} as const

// Type for channel validation
export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]

// Event channel names (for renderer -> main communication)
export const IPC_EVENT_CHANNELS = {
  SCAN_STARTED: 'scan:started',
  SCAN_PROGRESS: 'scan:progress',
  SCAN_COMPLETED: 'scan:completed', 
  SCAN_CANCELLED: 'scan:cancelled',
  SCAN_ERROR: 'scan:error',
  APP_ERROR: 'app:error',
  APP_STATUS: 'app:status'
} as const

export type IpcEventChannel = typeof IPC_EVENT_CHANNELS[keyof typeof IPC_EVENT_CHANNELS]