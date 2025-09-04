/// <reference types="vite/client" />

import type { RummageApi } from './preload/api'

declare global {
  interface Window {
    // Rummage API
    rummage: RummageApi
    // Legacy API (for backward compatibility)
    app: { 
      ping: () => Promise<string>
      db: { 
        getSchemaVersion: () => Promise<string | null>
        setMeta: (k: string, v: string) => Promise<boolean> 
      } 
    }
  }
}
