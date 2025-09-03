// Electron integration barrel exports
export { RummageApp } from './main/RummageApp'
export { setupIpcHandlers, cleanupIpcHandlers } from './main/ipcHandlers'
export { rummageApi } from './preload/api'
export type { RummageApi } from './preload/api'