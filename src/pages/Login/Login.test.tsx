import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './page'

const mockAuth = {
  login: vi.fn(),
  isAuthenticated: false,
}

const mockLoading = {
  showLoading: false,
  setShowLoading: vi.fn(),
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
  AuthContext: { Provider: ({ children }: any) => children },
}))

vi.mock('@/contexts/LoadingContext', () => ({
  useLoading: () => mockLoading,
  LoadingContext: { Provider: ({ children }: any) => children },
}))

describe('Login Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.login.mockResolvedValue({ success: true })
  })

  it('should update form fields when typing', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')

    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should call login with credentials on submit', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(mockAuth.login).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should show error message on failed login', async () => {
    const user = userEvent.setup()
    mockAuth.login.mockResolvedValue({ 
      success: false, 
      error: 'Invalid credentials' 
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText('Username'), 'wronguser')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})