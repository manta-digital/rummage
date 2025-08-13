import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('app', {
  ping: () => ipcRenderer.invoke('ping'),
  db: {
    getSchemaVersion: () => ipcRenderer.invoke('db:getSchemaVersion'),
    setMeta: (key: string, value: string) => ipcRenderer.invoke('db:setMeta', key, value)
  }
})


