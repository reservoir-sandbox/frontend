import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Register from './page'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
  AuthContext: { Provider: ({ children }: any) => children },
}))

describe('Register Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate password length - show error for short password', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText('Password')
    const confirmInput = screen.getByLabelText('Confirm Password')

    await user.type(passwordInput, 'short')
    await user.type(confirmInput, 'short')

    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
  })

  it('should show password mismatch error', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password456')

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('should clear password errors when passwords match', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText('Password')
    const confirmInput = screen.getByLabelText('Confirm Password')

    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password456')
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()

    await user.clear(confirmInput)
    await user.type(confirmInput, 'password123')
    
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })
})