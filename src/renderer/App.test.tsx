import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />)
    // Basic smoke test - just ensure the app renders
    expect(document.body).toBeInTheDocument()
  })

  it('should render the app title in homepage', () => {
    render(<App />)
    expect(screen.getAllByText('Rummage')[0]).toBeInTheDocument()
  })

  it('should have proper routing structure', () => {
    render(<App />)
    // Just check that the navigation menu exists
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Examples').length).toBeGreaterThan(0)
  })
})