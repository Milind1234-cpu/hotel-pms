import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function CheckIn() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('confirmed')

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/rooms/'),
      ])
      setBookings(bookingsRes.data)
      setRooms(roomsRes.data)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getRoomNumber = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.room_number : 'Unknown'
  }

  const handleCheckIn = async (id) => {
    if (!confirm('Confirm check-in for this guest?')) return
    try {
      await api.post(`/checkin/checkin/${id}`)
      toast.success('Guest checked in successfully!')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-in failed')
    }
  }

  const handleCheckOut = async (id) => {
    if (!confirm('Confirm check-out? An invoice will be generated.')) return
    try {
      const res = await api.post(`/checkin/checkout/${id}`)
      const formatted = Number(res.data.total_amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      toast.success(`Checked out! Total: ₹${formatted}`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-out failed')
    }
  }

  const confirmed = bookings.filter(b => b.status === 'Confirmed')
  const checkedIn = bookings.filter(b => b.status === 'Checked In')
  const checkedOut = bookings.filter(b => b.status === 'Checked Out')

  const getTabData = () => {
    if (activeTab === 'confirmed') return confirmed
    if (activeTab === 'checkedin') return checkedIn
    return checkedOut
  }

  // Returns initials from a guest name
  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Avatar background colors cycling through a palette
  const avatarColors = [
    'bg-primary/80',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-sky-600',
  ]
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length]

  const tabData = getTabData()

  return (
    <Layout>
      {/* ── Page Header & Stats ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Check-In / Out</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
            Manage guest arrivals and departures
          </p>
        </div>

        {/* Compact Bento Stats */}
        <div className="flex gap-4 flex-wrap">
          {/* Awaiting */}
          <div className="checkin-stat-card px-6 py-4 rounded-2xl flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[28px]">luggage</span>
            </div>
            <div className="flex flex-col">
              <span className="checkin-label-upper mb-1">Awaiting</span>
              <span className="text-2xl font-black text-slate-900">{confirmed.length}</span>
            </div>
          </div>

          {/* Occupied / Checked-In */}
          <div className="checkin-stat-card px-6 py-4 rounded-2xl flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <span className="material-symbols-outlined text-[28px]">meeting_room</span>
            </div>
            <div className="flex flex-col">
              <span className="checkin-label-upper mb-1">Occupied</span>
              <span className="text-2xl font-black text-slate-900">{checkedIn.length}</span>
            </div>
          </div>

          {/* Checked Out */}
          <div className="checkin-stat-card px-6 py-4 rounded-2xl flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
              <span className="material-symbols-outlined text-[28px]">door_back</span>
            </div>
            <div className="flex flex-col">
              <span className="checkin-label-upper mb-1">Departed</span>
              <span className="text-2xl font-black text-slate-900">{checkedOut.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'confirmed'
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Arrivals <span className="ml-1 opacity-50 font-normal">({confirmed.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('checkedin')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'checkedin'
                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            In-House <span className="ml-1 opacity-50 font-normal">({checkedIn.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('checkedout')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'checkedout'
                ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Departed <span className="ml-1 opacity-50 font-normal">({checkedOut.length})</span>
          </button>
        </div>
      </div>

      {/* ── Guest List ──────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin mr-3">progress_activity</span>
          <span className="text-lg font-medium">Loading guests…</span>
        </div>
      ) : tabData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">hotel</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-600">No guests in this category</p>
            <p className="text-sm text-slate-400 mt-1">Records will appear here once available.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {tabData.map((b, index) => (
            <GuestCard
              key={b.id}
              booking={b}
              roomNumber={getRoomNumber(b.room_id)}
              initials={getInitials(b.guest_name)}
              avatarColor={getAvatarColor(index)}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

/* ── Guest Card Sub-Component ───────────────────────────────── */
function GuestCard({ booking: b, roomNumber, initials, avatarColor, onCheckIn, onCheckOut }) {
  const isConfirmed  = b.status === 'Confirmed'
  const isCheckedIn  = b.status === 'Checked In'
  const isCheckedOut = b.status === 'Checked Out'

  const statusBadge = isConfirmed
    ? { label: 'Confirmed',   cls: 'bg-primary/10 text-primary' }
    : isCheckedIn
    ? { label: 'Checked In',  cls: 'bg-emerald-50 text-emerald-600' }
    : { label: 'Checked Out', cls: 'bg-slate-100 text-slate-500' }

  return (
    <div
      className={`checkin-premium-card p-6 rounded-3xl relative overflow-hidden ${
        isCheckedIn  ? 'border-emerald-100' :
        isCheckedOut ? 'opacity-80'         : ''
      }`}
    >
      {/* Status badge – top-right */}
      <div className="absolute top-0 right-0 p-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Guest identity row */}
      <div className={`flex gap-4 mb-5 ${isCheckedOut ? 'opacity-60 grayscale-[0.4]' : ''}`}>
        <div
          className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-inner`}
        >
          {initials}
        </div>
        <div className="pt-1">
          <h4 className="text-lg font-bold text-slate-900 tracking-tight">{b.guest_name}</h4>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{b.guest_email}</p>
          {b.guest_phone && (
            <p className="text-xs text-slate-400 mt-0.5">{b.guest_phone}</p>
          )}
        </div>
      </div>

      {/* Stay details grid */}
      <div
        className={`grid grid-cols-2 gap-5 p-4 rounded-2xl mb-5 border ${
          isCheckedIn
            ? 'bg-emerald-50/30 border-emerald-100/50'
            : isCheckedOut
            ? 'bg-white/30 border-slate-100'
            : 'bg-slate-50/50 border-slate-100'
        }`}
      >
        <div className="space-y-0.5">
          <span className="checkin-label-upper">Room No.</span>
          <p className={`text-lg font-extrabold ${isCheckedIn ? 'text-emerald-900' : 'text-slate-800'}`}>
            {roomNumber}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="checkin-label-upper">Check-In</span>
          <p className={`text-base font-bold ${isCheckedIn ? 'text-emerald-900' : 'text-slate-700'}`}>
            {b.check_in_date}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="checkin-label-upper">Check-Out</span>
          <p className={`text-base font-bold ${isCheckedIn ? 'text-emerald-900' : 'text-slate-700'}`}>
            {b.check_out_date}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="checkin-label-upper">Guests</span>
          <p className={`text-lg font-extrabold ${isCheckedIn ? 'text-emerald-900' : 'text-slate-800'}`}>
            {b.num_guests}
          </p>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        {/* Left status indicator */}
        {isCheckedIn && (
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-xs font-bold uppercase tracking-wider">Folio Active</span>
          </div>
        )}
        {isCheckedOut && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            <span className="text-xs font-bold uppercase tracking-wider">Stay Complete</span>
          </div>
        )}
        {isConfirmed && (
          <div className="flex items-center gap-2 text-primary/60">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Arrival</span>
          </div>
        )}

        {/* Action button */}
        {isConfirmed && (
          <button
            onClick={() => onCheckIn(b.id)}
            className="bg-primary hover:bg-[#0052de] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Check In
          </button>
        )}
        {isCheckedIn && (
          <button
            onClick={() => onCheckOut(b.id)}
            className="checkin-checkout-btn px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            Check Out
          </button>
        )}
        {isCheckedOut && (
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completed</span>
        )}
      </div>
    </div>
  )
}
