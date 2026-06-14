import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Bookings() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [allRooms, setAllRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    num_guests: 1,
    room_id: '',
    check_in_date: '',
    check_out_date: '',
  })

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const [bookingsRes, availableRoomsRes, allRoomsRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/rooms/available/list'),
        api.get('/rooms/'),
      ])
      setBookings(bookingsRes.data)
      setRooms(availableRoomsRes.data)
      setAllRooms(allRoomsRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll()
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getRoomNumber = (roomId) => {
    const room = allRooms.find(r => r.id === roomId)
    return room ? room.room_number : roomId
  }

  const getRoomType = (roomId) => {
    const room = allRooms.find(r => r.id === roomId)
    return room ? room.room_type : ''
  }

  const getGuestInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    // Parse as local dates to avoid UTC offset issues
    const [ciY, ciM, ciD] = checkIn.split('-').map(Number)
    const [coY, coM, coD] = checkOut.split('-').map(Number)
    const diff = new Date(coY, coM - 1, coD) - new Date(ciY, ciM - 1, ciD)
    const nights = Math.round(diff / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 0
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateDates = () => {
    if (!form.check_in_date || !form.check_out_date) {
      return true // Let required validation handle this
    }
    const checkIn = new Date(form.check_in_date)
    const checkOut = new Date(form.check_out_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      toast.error('Check-in date cannot be in the past')
      return false
    }
    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateDates()) return

    try {
      await api.post('/bookings/', form)
      toast.success('Booking created successfully!')
      closeModal()
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create booking')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setForm({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      num_guests: 1,
      room_id: '',
      check_in_date: '',
      check_out_date: '',
    })
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel')
    }
  }

  // ── Status Styling ─────────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':   return 'bg-blue-50 text-blue-600 border border-blue-100'
      case 'Checked In':  return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      case 'Checked Out': return 'bg-slate-100 text-slate-500 border border-slate-200'
      case 'Cancelled':   return 'bg-red-50 text-red-500 border border-red-100'
      default:            return 'bg-slate-100 text-slate-500 border border-slate-200'
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="px-2xl py-2xl max-w-[1500px] mx-auto space-y-2xl">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-xl">
          <div className="space-y-1">
            <h2 className="text-[32px] font-bold tracking-tight text-on-surface leading-none">
              Reservations
            </h2>
            <p className="text-sm font-normal text-on-surface-variant/70 tracking-tight">
              {loading ? 'Loading bookings…' : `Managing ${bookings.length} booking${bookings.length !== 1 ? 's' : ''} across property`}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm active:scale-[0.98] transition-all flex items-center gap-2 self-start lg:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Booking
          </button>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {/* Total Bookings */}
          <div className="bg-white p-xl rounded-2xl premium-border shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em]">
                Total Bookings
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-on-surface">
                {loading ? '—' : bookings.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">reservations</span>
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-white p-xl rounded-2xl premium-border shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em]">
                Confirmed
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">Awaiting</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-on-surface">
                {loading ? '—' : bookings.filter(b => b.status === 'Confirmed').length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">guests</span>
            </div>
          </div>

          {/* Checked In */}
          <div className="bg-white p-xl rounded-2xl premium-border shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em]">
                In Residence
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold">Active</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-primary">
                {loading ? '—' : bookings.filter(b => b.status === 'Checked In').length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">guests</span>
            </div>
          </div>

          {/* Available Rooms */}
          <div className="bg-white p-xl rounded-2xl premium-border shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em]">
                Available Rooms
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-on-surface">
                {loading ? '—' : rooms.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">rooms</span>
            </div>
          </div>
        </div>

        {/* ── Data Table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl premium-border shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-on-surface-variant/60 text-sm font-medium">
              Loading reservations…
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 block">
                book_online
              </span>
              <p className="text-base font-semibold text-on-surface-variant">No bookings found</p>
              <p className="text-sm text-on-surface-variant/60">Create a new booking to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-surface-variant/30">
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      Guest Details
                    </th>
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      Accommodation
                    </th>
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      Schedule
                    </th>
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      Details
                    </th>
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-xl py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {bookings.map((b) => {
                    const nights = getNights(b.check_in_date, b.check_out_date)
                    const initials = getGuestInitials(b.guest_name)
                    return (
                      <tr key={b.id} className="table-row-hover group transition-colors">
                        {/* Guest Details */}
                        <td className="px-xl py-6">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs border border-primary/10 flex-shrink-0">
                              {initials}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-on-surface tracking-tight">
                                {b.guest_name}
                              </p>
                              <p className="text-xs text-on-surface-variant/60 font-medium">
                                {b.guest_email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Accommodation */}
                        <td className="px-xl py-6">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-on-surface">
                              {getRoomType(b.room_id)} #{getRoomNumber(b.room_id)}
                            </p>
                            {b.guest_phone && (
                              <p className="text-[11px] text-on-surface-variant/60 font-medium tracking-wide">
                                {b.guest_phone}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="px-xl py-6">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-on-surface">
                              {formatDate(b.check_in_date)} — {formatDate(b.check_out_date)}
                            </p>
                            <p className="text-[11px] text-primary/70 font-semibold tracking-wider uppercase">
                              {nights} Night{nights !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-xl py-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">
                              {b.num_guests > 1 ? 'group' : 'person'}
                            </span>
                            <span className="text-sm font-medium text-on-surface-variant">
                              {b.num_guests} Guest{b.num_guests !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-xl py-6">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusColor(b.status)}`}>
                            {b.status === 'Checked In' ? 'In Residence' : b.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-xl py-6 text-right">
                          {b.status === 'Confirmed' ? (
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-error/70 hover:text-error hover:bg-error/5 rounded-md transition-all border border-transparent hover:border-error/10"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && bookings.length > 0 && (
            <div className="px-xl py-5 border-t border-surface-variant/10 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs font-semibold text-on-surface-variant/60">
                Showing <span className="text-on-surface">{bookings.length}</span>{' '}
                reservation{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── New Booking Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-xl py-5 border-b border-surface-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-md">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">book_online</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">New Reservation</h2>
                  <p className="text-xs text-on-surface-variant/60 font-medium">Fill in guest & stay details</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-xl space-y-4">
              {/* Guest Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="guest_name" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    Guest Name
                  </label>
                  <input
                    id="guest_name"
                    name="guest_name"
                    value={form.guest_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="guest_email" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    Email
                  </label>
                  <input
                    id="guest_email"
                    name="guest_email"
                    type="email"
                    value={form.guest_email}
                    onChange={handleChange}
                    required
                    placeholder="guest@email.com"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              {/* Phone + No. of Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="guest_phone" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    Phone
                  </label>
                  <input
                    id="guest_phone"
                    name="guest_phone"
                    value={form.guest_phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="num_guests" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    No. of Guests
                  </label>
                  <input
                    id="num_guests"
                    name="num_guests"
                    type="number"
                    min="1"
                    value={form.num_guests}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-1.5">
                <label htmlFor="room_id" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                  Select Room
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px] pointer-events-none">
                    bed
                  </span>
                  <select
                    id="room_id"
                    name="room_id"
                    value={form.room_id}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none"
                  >
                    <option value="">— Select a room —</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} — {r.room_type} — ₹{r.price_per_night}/night
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Check-In / Check-Out Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="check_in_date" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    Check-In Date
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[16px] pointer-events-none">
                      calendar_today
                    </span>
                    <input
                      id="check_in_date"
                      name="check_in_date"
                      type="date"
                      value={form.check_in_date}
                      onChange={handleChange}
                      min={getTodayDate()}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-10 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="check_out_date" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">
                    Check-Out Date
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[16px] pointer-events-none">
                      calendar_today
                    </span>
                    <input
                      id="check_out_date"
                      name="check_out_date"
                      type="date"
                      value={form.check_out_date}
                      onChange={handleChange}
                      min={form.check_in_date || getTodayDate()}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-10 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Night count preview */}
              {form.check_in_date && form.check_out_date && getNights(form.check_in_date, form.check_out_date) > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-[16px]">nights_stay</span>
                  <span className="text-xs font-semibold text-primary">
                    {getNights(form.check_in_date, form.check_out_date)} Night{getNights(form.check_in_date, form.check_out_date) !== 1 ? 's' : ''} Stay
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg text-sm tracking-wide shadow-sm active:scale-[0.98] transition-all"
                >
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold py-2.5 rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
