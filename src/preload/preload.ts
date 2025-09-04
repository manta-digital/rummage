import { contextBridge } from 'electron'
import { rummageApi, electronAPI } from './api'

// Expose the formal ElectronAPI to the renderer process (main interface)
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Legacy API for backward compatibility (can be removed after migration)
contextBridge.exposeInMainWorld('rummage', rummageApi)
contextBridge.exposeInMainWorld('app', {
  ping: rummageApi.ping,
  db: {
    getSchemaVersion: rummageApi.db.getSchemaVersion,
    setMeta: rummageApi.db.setMeta
  }
})