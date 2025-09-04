import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './lib/ui-core'
import { ReactHeader, ReactFooter } from './components'
import { headerContent, footerContent } from './content'
import HomePage from './pages/HomePage'
import ExamplesPage from './pages/ExamplesPage'

function App() {
  // Theme persistence script equivalent to Next.js
  useEffect(() => {
    const stored = localStorage.getItem('ui-theme')
    if (stored) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(stored)
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(media.matches ? 'dark' : 'light')
    }
  }, [])

  return (
    <Router>
      <ThemeProvider 
        defaultTheme="dark" 
        storageKey="ui-theme"
      >
        <div className="min-h-screen flex flex-col">
          <ReactHeader
            content={headerContent}
            LinkComponent={Link}
          />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/examples" element={<ExamplesPage />} />
            </Routes>
          </main>
          <ReactFooter
            variant="compact"
            legalPreset="mit"
            sections={footerContent}
            LinkComponent={Link}
          />
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App
