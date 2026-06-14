import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'

// Mock the modules
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Component - Password Toggle Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders password input with type="password" by default', () => {
    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('renders visibility icon by default (password hidden)', () => {
    renderWithProviders(<Login />)
    const visibilityIcon = screen.getByText('visibility')
    expect(visibilityIcon).toBeInTheDocument()
  })

  it('toggles password input type to text when visibility button is clicked', () => {
    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    fireEvent.click(toggleButton)

    // Should change to text type
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('toggles password input type back to password when visibility button is clicked again', () => {
    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('changes icon from visibility to visibility_off when password is shown', () => {
    renderWithProviders(<Login />)
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Initially shows visibility icon
    expect(screen.getByText('visibility')).toBeInTheDocument()

    // Click to show password
    fireEvent.click(toggleButton)

    // Should now show visibility_off icon
    expect(screen.getByText('visibility_off')).toBeInTheDocument()
    expect(screen.queryByText('visibility')).not.toBeInTheDocument()
  })

  it('changes icon back to visibility when password is hidden again', () => {
    renderWithProviders(<Login />)
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Click to show password
    fireEvent.click(toggleButton)
    expect(screen.getByText('visibility_off')).toBeInTheDocument()

    // Click to hide password
    fireEvent.click(toggleButton)
    expect(screen.getByText('visibility')).toBeInTheDocument()
    expect(screen.queryByText('visibility_off')).not.toBeInTheDocument()
  })

  it('allows typing in password input regardless of visibility state', () => {
    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Type password when hidden
    fireEvent.change(passwordInput, { target: { value: 'secretPassword123' } })
    expect(passwordInput).toHaveValue('secretPassword123')

    // Show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveValue('secretPassword123')
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Update password when visible
    fireEvent.change(passwordInput, { target: { value: 'newPassword456' } })
    expect(passwordInput).toHaveValue('newPassword456')

    // Hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveValue('newPassword456')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('toggles multiple times correctly', () => {
    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: /visibility/i })

    // Test multiple toggles
    for (let i = 0; i < 5; i++) {
      fireEvent.click(toggleButton)
      const expectedType = i % 2 === 0 ? 'text' : 'password'
      expect(passwordInput).toHaveAttribute('type', expectedType)
    }
  })

  it('does not submit form when toggle button is clicked', () => {
    renderWithProviders(<Login />)
    const toggleButton = screen.getByRole('button', { name: /visibility/i })
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')
    
    const handleSubmit = vi.fn((e) => e.preventDefault())
    form.addEventListener('submit', handleSubmit)

    // Click toggle button
    fireEvent.click(toggleButton)

    // Form should not be submitted
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
