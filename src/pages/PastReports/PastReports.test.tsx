import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PastReports from './page'

const mockFetch = vi.fn()
global.fetch = mockFetch

const mockSamples = [
  {
    sample_id: 1,
    filename: 'sample1.csv',
    uploaded_at: '2024-01-01T12:00:00Z',
    latest_job_id: 101,
    latest_job_status: 'completed',
  },
  {
    sample_id: 2,
    filename: 'sample2.csv',
    uploaded_at: '2024-01-02T12:00:00Z',
    latest_job_id: null,
    latest_job_status: null,
  },
]

describe('Past Reports Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('reservoir-bearer-token', 'fake-token')
  })

  it('should render samples list correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockSamples),
    })

    render(
      <BrowserRouter>
        <PastReports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('sample1.csv')).toBeInTheDocument()
      expect(screen.getByText('sample2.csv')).toBeInTheDocument()
    })
  })

  it('should show "No samples" message when list is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })

    render(
      <BrowserRouter>
        <PastReports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No samples found. Upload your first sample!')).toBeInTheDocument()
    })
  })

  it('should show error when API fails', async () => {
    // Mock the error response properly
    const errorMessage = 'Network error'
    mockFetch.mockRejectedValueOnce(new Error(errorMessage))

    render(
      <BrowserRouter>
        <PastReports />
      </BrowserRouter>
    )

    // Component shows the error message from the caught error
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})