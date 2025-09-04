import { contextBridge } from 'electron'
import { rummageApi } from './api'

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('rummage', rummageApi)

// Legacy API for backward compatibility (can be removed after migration)
contextBridge.exposeInMainWorld('app', {
  ping: rummageApi.ping,
  db: {
    getSchemaVersion: rummageApi.db.getSchemaVersion,
    setMeta: rummageApi.db.setMeta
  }
})