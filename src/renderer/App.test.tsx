import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('should render the app title', () => {
    render(<App />)
    expect(screen.getAllByText('Rummage')[0]).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<App />)
    expect(screen.getAllByText('Local-First AI Photo & File Librarian')[0]).toBeInTheDocument()
  })

  it('should render IPC test message', () => {
    render(<App />)
    expect(screen.getAllByText(/IPC test:/)[0]).toBeInTheDocument()
  })

  it('should render database status', () => {
    render(<App />)
    expect(screen.getAllByText(/DB schema version:/)[0]).toBeInTheDocument()
  })
})