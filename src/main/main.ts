import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import { getDatabasePath, initializeDatabase, getMeta, setMeta } from './services/db'

function isAllowedUrl(target: string): boolean {
  try {
    const u = new URL(target)
    return u.protocol === 'https:' && u.hostname === 'example.com'
  } catch {
    return false
  }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/preload.mjs', import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  // Example secure navigation policy
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url)) {
      setImmediate(() => shell.openExternal(url))
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (e, url) => {
    if (!isAllowedUrl(url)) e.preventDefault()
  })

  // Example secure IPC
  ipcMain.handle('ping', (e) => {
    if (!e.senderFrame?.url) return 'pong'
    return 'pong'
  })

  ipcMain.handle('db:getSchemaVersion', () => {
    return getMeta('schema_version')
  })

  ipcMain.handle('db:setMeta', (_e, key: string, value: string) => {
    setMeta(key, value)
    return true
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(fileURLToPath(new URL('../../index.html', import.meta.url)))
  }
}

app.whenReady().then(() => {
  process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = 'true'
  const dbPath = getDatabasePath(app.getPath('userData'))
  initializeDatabase(dbPath)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


