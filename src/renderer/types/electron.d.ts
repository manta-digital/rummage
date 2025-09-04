import type { ElectronAPI } from '../../shared/types/ipc'

/**
 * Global type declarations for the renderer process
 * Ensures type safety across the main/renderer boundary
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI
    
    // Legacy API for backward compatibility (used by current implementation)
    rummage: ElectronAPI
    app: {
      ping: () => Promise<string>
      db: {
        getSchemaVersion: () => Promise<string | null>
        setMeta: (k: string, v: string) => Promise<boolean>
      }
    }
  }
}

// Required for module augmentation
export {}