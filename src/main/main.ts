import { app, BrowserWindow, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import { RummageApp } from './RummageApp'
import { setupIpcHandlers, cleanupIpcHandlers } from './ipcHandlers'

// Global app instance
let rummageApp: RummageApp
let mainWindow: BrowserWindow | null = null

function isAllowedUrl(target: string): boolean {
  try {
    const u = new URL(target)
    return u.protocol === 'https:' && u.hostname === 'example.com'
  } catch {
    return false
  }
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: fileURLToPath(new URL('../../out/preload/preload.mjs', import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: !process.env.ELECTRON_RENDERER_URL
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

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(fileURLToPath(new URL('../../index.html', import.meta.url)))
  }

  return win
}

app.whenReady().then(async () => {
  process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = 'true'
  
  // Initialize the core application
  rummageApp = new RummageApp()
  await rummageApp.initialize()
  
  // Create main window
  mainWindow = createWindow()
  
  // Set up IPC handlers with window reference
  setupIpcHandlers(rummageApp, mainWindow)
  
  // Tight CSP in production
  if (!process.env.ELECTRON_RENDERER_URL) {
    const { session } = require('electron') as typeof import('electron')
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';"
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp]
        }
      })
    })
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', async () => {
  // Clean shutdown
  cleanupIpcHandlers()
  if (rummageApp) {
    await rummageApp.shutdown()
  }
})