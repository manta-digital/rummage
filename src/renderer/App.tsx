import React from 'react'
import './globals.css'

import type { RummageApi } from '../electron/preload/api'

declare global {
  interface Window {
    // Legacy API (for backward compatibility)
    app: { 
      ping: () => Promise<string>
      db: { 
        getSchemaVersion: () => Promise<string | null>
        setMeta: (k: string, v: string) => Promise<boolean> 
      } 
    }
    // New structured API
    rummage: RummageApi
  }
}

export default function App() {
  const [message, setMessage] = React.useState<string>('loading...')

  React.useEffect(() => {
    try {
      const ping = window?.app?.ping
      if (typeof ping === 'function') {
        ping().then(setMessage).catch((e) => setMessage(String(e)))
      } else {
        setMessage('preload not available')
      }
    } catch (e) {
      setMessage(String(e))
    }
  }, [])

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Rummage</h1>
        <p className="text-gray-600">Local-First AI Photo & File Librarian</p>
        <p className="mt-6 text-sm text-gray-500">IPC test: {message}</p>
        <DbStatus />
      </div>
    </div>
  )
}

function DbStatus() {
  const [schema, setSchema] = React.useState<string | null>('...')
  React.useEffect(() => {
    window.app.db.getSchemaVersion().then(setSchema).catch(() => setSchema(null))
  }, [])
  return (
    <p className="mt-2 text-xs text-gray-500">DB schema version: {schema ?? 'unavailable'}</p>
  )
}


