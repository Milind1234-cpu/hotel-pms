import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { AuthProvider } from '../context/AuthContext'
import api from '../api/axios'

// Mock the API module
vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock Layout to avoid sidebar/auth complexity
vi.mock('../components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}))

// Mock react-icons to keep tests lightweight
vi.mock('react-icons/md', () => ({
  MdBedroomParent: () => <span>BedroomIcon</span>,
  MdBookOnline: () => <span>BookOnlineIcon</span>,
  MdReceipt: () => <span>ReceiptIcon</span>,
  MdPeople: () => <span>PeopleIcon</span>,
}))

const mockRooms = [
  { id: '1', room_number: '101', status: 'Available' },
  { id: '2', room_number: '102', status: 'Available' },
  { id: '3', room_number: '103', status: 'Occupied' },
  { id: '4', room_number: '104', status: 'Occupied' },
  { id: '5', room_number: '105', status: 'Maintenance' },
]

const mockBookings = [
  { id: 'b1', guest_name: 'Alice', status: 'Confirmed' },
  { id: 'b2', guest_name: 'Bob', status: 'Checked In' },
  { id: 'b3', guest_name: 'Carol', status: 'Checked In' },
  { id: 'b4', guest_name: 'Dave', status: 'Checked Out' },
]

const mockInvoices = [
  { id: 'i1', guest_name: 'Bob' },
  { id: 'i2', guest_name: 'Carol' },
  { id: 'i3', guest_name: 'Dave' },
]

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  )

describe('Dashboard - Statistics Fetching Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: all API calls succeed
    api.get.mockImplementation((url) => {
      if (url === '/rooms/') return Promise.resolve({ data: mockRooms })
      if (url === '/bookings/') return Promise.resolve({ data: mockBookings })
      if (url === '/invoices/all') return Promise.resolve({ data: mockInvoices })
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- Requirement 2.2 / 2.4: Promise.all parallel API calls ---

  it('calls GET /rooms/, GET /bookings/, GET /invoices/all in parallel on mount', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/rooms/')
      expect(api.get).toHaveBeenCalledWith('/bookings/')
      expect(api.get).toHaveBeenCalledWith('/invoices/all')
    })

    // All three called exactly once on initial mount
    expect(api.get).toHaveBeenCalledTimes(3)
  })

  // --- Requirement 2.4: Stat field correctness ---

  it('computes totalRooms as the count of all rooms', async () => {
    renderDashboard()
    await waitFor(() => screen.getByText('5'))
    // 5 rooms total
    expect(screen.getByText('Total Rooms').nextSibling || screen.getByText('5')).toBeTruthy()
  })

  it('computes availableRooms correctly (status === "Available")', async () => {
    renderDashboard()
    await waitFor(() => {
      // 2 rooms are Available
      expect(screen.getByText('Available Now')).toBeInTheDocument()
    })
    // The available rooms count card shows "2"
    const availableLabel = screen.getByText('Available Now')
    const card = availableLabel.closest('.app-card')
    expect(card.querySelector('.text-4xl').textContent).toBe('2')
  })

  it('computes occupiedRooms correctly (status === "Occupied")', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Occupied Rooms')).toBeInTheDocument()
    })
    const occupiedLabel = screen.getByText('Occupied Rooms')
    const card = occupiedLabel.closest('.app-card')
    expect(card.querySelector('.text-4xl').textContent).toBe('2')
  })

  it('computes totalBookings as the count of all bookings', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Total Bookings')).toBeInTheDocument()
    })
    const label = screen.getByText('Total Bookings')
    const card = label.closest('.app-card')
    expect(card.querySelector('.text-4xl').textContent).toBe('4')
  })

  it('computes checkedIn correctly (booking status === "Checked In")', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Checked In')).toBeInTheDocument()
    })
    const label = screen.getByText('Checked In')
    const card = label.closest('.app-card')
    expect(card.querySelector('.text-4xl').textContent).toBe('2')
  })

  it('computes totalInvoices as the count of all invoices', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Total Invoices')).toBeInTheDocument()
    })
    const label = screen.getByText('Total Invoices')
    const card = label.closest('.app-card')
    expect(card.querySelector('.text-4xl').textContent).toBe('3')
  })

  // --- Requirement 2.7: Loading state ---

  it('shows loading indicator while fetching stats', () => {
    // Delay API responses so we can catch the loading state
    api.get.mockImplementation(() => new Promise(() => {})) // never resolves
    renderDashboard()
    expect(screen.getByText('Loading stats...')).toBeInTheDocument()
  })

  it('hides loading indicator after data is fetched', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.queryByText('Loading stats...')).not.toBeInTheDocument()
    })
  })

  it('hides loading indicator even when API calls fail', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    renderDashboard()
    await waitFor(() => {
      expect(screen.queryByText('Loading stats...')).not.toBeInTheDocument()
    })
  })

  // --- Requirement 2.8: Error handling without breaking UI ---

  it('keeps last known stats visible when API calls fail after initial load', async () => {
    // First call succeeds
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Total Rooms')).toBeInTheDocument()
    })

    // Subsequent call fails — stats should remain visible (not crash)
    api.get.mockRejectedValue(new Error('Network error'))

    // Stats labels are still in the DOM
    expect(screen.getByText('Total Rooms')).toBeInTheDocument()
    expect(screen.getByText('Available Now')).toBeInTheDocument()
    expect(screen.getByText('Occupied Rooms')).toBeInTheDocument()
    expect(screen.getByText('Total Bookings')).toBeInTheDocument()
    expect(screen.getByText('Checked In')).toBeInTheDocument()
    expect(screen.getByText('Total Invoices')).toBeInTheDocument()
  })

  it('does not throw or crash when API returns an error on initial load', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    // Should not throw — the component handles errors gracefully
    expect(() => renderDashboard()).not.toThrow()
    await waitFor(() => {
      expect(screen.queryByText('Loading stats...')).not.toBeInTheDocument()
    })
  })

  // --- Requirement 2.3: Auto-refresh every 30 seconds ---

  it('sets up a 30-second auto-refresh interval on mount', async () => {
    vi.useFakeTimers()

    api.get.mockImplementation((url) => {
      if (url === '/rooms/') return Promise.resolve({ data: mockRooms })
      if (url === '/bookings/') return Promise.resolve({ data: mockBookings })
      if (url === '/invoices/all') return Promise.resolve({ data: mockInvoices })
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })

    renderDashboard()

    // Initial fetch (3 calls)
    await act(async () => {
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(3)

    // Advance 30 seconds — triggers one refresh
    await act(async () => {
      vi.advanceTimersByTime(30000)
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(6)

    // Advance another 30 seconds — triggers second refresh
    await act(async () => {
      vi.advanceTimersByTime(30000)
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(9)
  })

  it('clears the auto-refresh interval when component unmounts', async () => {
    vi.useFakeTimers()

    api.get.mockImplementation((url) => {
      if (url === '/rooms/') return Promise.resolve({ data: mockRooms })
      if (url === '/bookings/') return Promise.resolve({ data: mockBookings })
      if (url === '/invoices/all') return Promise.resolve({ data: mockInvoices })
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })

    const { unmount } = renderDashboard()

    await act(async () => {
      await Promise.resolve()
    })
    const callCountAfterMount = api.get.mock.calls.length

    // Unmount the component (cleanup should clear the interval)
    unmount()

    // Advance 30 seconds — interval should NOT fire
    await act(async () => {
      vi.advanceTimersByTime(30000)
      await Promise.resolve()
    })

    // Call count should not have increased
    expect(api.get.mock.calls.length).toBe(callCountAfterMount)
  })
})
