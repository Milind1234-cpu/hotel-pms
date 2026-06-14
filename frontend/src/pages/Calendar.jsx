import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Calendar() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRes, roomsRes] = await Promise.all([
          api.get('/bookings/'),
          api.get('/rooms/'),
        ])
        setBookings(bookingsRes.data)
        setRooms(roomsRes.data)
      } catch {
        toast.error('Failed to load calendar data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Get all days in current month
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = getFirstDayOfMonth(date)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, year, month }
  }

  // Check if a room is booked on a specific date
  const getBookingForRoomAndDate = (roomId, day) => {
    const { year, month } = getDaysInMonth(currentDate)
    const checkDate = new Date(year, month, day)

    return bookings.find((b) => {
      if (b.room_id !== roomId) return false
      if (b.status === 'Cancelled') return false
      // Parse ISO dates as local time to avoid UTC offset shifting the date
      const [ciY, ciM, ciD] = b.check_in_date.split('-').map(Number)
      const [coY, coM, coD] = b.check_out_date.split('-').map(Number)
      const checkIn  = new Date(ciY, ciM - 1, ciD)
      const checkOut = new Date(coY, coM - 1, coD)
      return checkDate >= checkIn && checkDate < checkOut
    })
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentDate)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  // Count available rooms for a given day
  const getAvailableCount = (day) => {
    return rooms.filter((room) => {
      if (room.status === 'Maintenance') return false
      return !getBookingForRoomAndDate(room.id, day)
    }).length
  }

  return (
    <Layout>
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#c3c5d8]/30 px-8 py-6 flex justify-between items-center -mx-8 -mt-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-premium text-[#191c1e]">Availability</h2>
          <p className="text-xs text-[#424655]/60 font-medium mt-1">
            Monitoring {rooms.length} unit{rooms.length !== 1 ? 's' : ''} — {monthNames[month]} {year}
          </p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="bg-[#0F5EF7] text-white px-8 py-3 rounded-full font-bold text-xs tracking-loose shadow-xl shadow-blue-500/20 hover:bg-[#0048C6] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          CREATE BOOKING
        </button>
      </header>

      <div className="space-y-8 max-w-[1600px]">
        {/* View Controls & Legend */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-8">
            <div>
              <h3 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[13px] font-semibold text-[#424655] tracking-wide uppercase opacity-70">
                  Live Inventory
                </p>
              </div>
            </div>
            <div className="h-12 w-px bg-[#c3c5d8]/30"></div>
            {/* Legend */}
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#c3c5d8]/20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                <span className="text-xs font-bold text-[#424655] tracking-wide">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
                <span className="text-xs font-bold text-[#424655] tracking-wide">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-xs font-bold text-[#424655] tracking-wide">Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Calendar Grid (8 cols) */}
          <div className="col-span-8 space-y-6">

            {/* Monthly Calendar */}
            <div className="bespoke-card rounded-3xl overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c5d8]/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-[#f2f4f6] rounded-full transition-colors text-[#0048c6]"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
                  </button>
                  <span className="text-base font-bold text-[#191c1e] tracking-tight min-w-[130px] text-center">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-[#f2f4f6] rounded-full transition-colors text-[#0048c6]"
                  >
                    <span className="material-symbols-outlined text-[20px] text-center pl-1">arrow_forward_ios</span>
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="text-xs font-bold text-[#0048c6] px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors tracking-wide"
                >
                  Jump to Today
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center border-b border-[#c3c5d8]/10">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                  <div
                    key={d}
                    className="py-3 text-[11px] font-extrabold text-[#424655]/50 tracking-[0.2em]"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Day Grid */}
              <div className="grid grid-cols-7">
                {/* Blank days before month start */}
                {blanks.map((b) => (
                  <div
                    key={`blank-${b}`}
                    className="min-h-[90px] p-3 border-r border-b border-[#c3c5d8]/10 bg-[#f2f4f6]/50"
                  />
                ))}

                {/* Actual days */}
                {days.map((day) => {
                  const todayFlag = isToday(day)
                  const availCount = rooms.length > 0 ? getAvailableCount(day) : null
                  const availPct = availCount !== null && rooms.length > 0
                    ? Math.round((availCount / rooms.length) * 100)
                    : null

                  return (
                    <div
                      key={day}
                      className={`min-h-[90px] p-3 border-r border-b border-[#c3c5d8]/10 group hover:bg-[#f2f4f6] transition-colors cursor-pointer flex flex-col ${
                        todayFlag ? 'bg-blue-50 ring-1 ring-inset ring-[#0048c6]/30 z-10' : ''
                      }`}
                    >
                      <span
                        className={`text-sm font-bold leading-none ${
                          todayFlag
                            ? 'w-7 h-7 flex items-center justify-center rounded-full bg-[#0048c6] text-white font-black text-xs'
                            : 'text-[#191c1e]'
                        }`}
                      >
                        {day}
                      </span>
                      {availPct !== null && (
                        <div className="mt-auto pt-2 flex flex-col gap-1">
                          <div className="h-1.5 w-full bg-green-500/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${availPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-green-700/70 tracking-wide">
                            {availPct}% AVAIL
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Room Availability Matrix */}
            <div className="bespoke-card rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#c3c5d8]/10 flex justify-between items-center">
                <h4 className="text-lg font-extrabold text-[#191c1e] tracking-tight">
                  Matrix Overview
                </h4>
                <span className="text-xs font-bold text-[#424655]/50 uppercase tracking-widest">
                  {monthNames[month]} {year}
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-3 text-[#424655]/60">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <span className="text-sm font-medium">Loading availability...</span>
                  </div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#424655]/20 block mb-4">
                    bed
                  </span>
                  <p className="text-base font-semibold text-[#424655]/60">No rooms available.</p>
                  <p className="text-sm mt-1 text-[#424655]/40">Please add rooms to view the calendar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f6]">
                        <th className="sticky left-0 bg-[#f2f4f6] z-20 px-8 py-4 text-left text-[11px] font-extrabold text-[#424655]/50 uppercase tracking-widest border-r border-[#c3c5d8]/10 min-w-[180px]">
                          Unit
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className={`px-2 py-4 text-center text-[11px] font-extrabold min-w-[40px] ${
                              isToday(day)
                                ? 'text-[#0048c6] bg-blue-50'
                                : 'text-[#424655]/50'
                            }`}
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c3c5d8]/10">
                      {rooms.map((room) => (
                        <tr
                          key={room.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="sticky left-0 bg-white group-hover:bg-[#F0F7FF] z-20 px-8 py-4 border-r border-[#c3c5d8]/10">
                            <p className="text-xs font-black text-[#191c1e]">
                              Room {room.room_number}
                            </p>
                            <p className="text-[9px] font-bold text-[#737687] uppercase tracking-tighter">
                              {room.room_type}
                            </p>
                          </td>
                          {days.map((day) => {
                            const booking = getBookingForRoomAndDate(room.id, day)
                            const isMaintenance = room.status === 'Maintenance'
                            const cellColor = isMaintenance
                              ? '#f59e0b'
                              : booking
                              ? '#f43f5e'
                              : '#10b981'
                            const cellTitle = booking
                              ? `Booked: ${booking.guest_name}`
                              : isMaintenance
                              ? 'Maintenance'
                              : 'Available'

                            return (
                              <td key={day} className="p-1">
                                <div
                                  className="heatmap-cell h-8 w-full rounded-md"
                                  style={{ backgroundColor: cellColor }}
                                  title={cellTitle}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Bento Cards (4 cols) */}
          <div className="col-span-4 space-y-6">
            {/* Occupancy Card */}
            <div className="bespoke-card rounded-[2.5rem] p-6 flex flex-col justify-between h-[220px] relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[11px] font-extrabold text-[#424655]/50 uppercase tracking-[0.2em] mb-4">
                  Current Occupancy
                </p>
                {!loading && rooms.length > 0 ? (
                  <>
                    <h4 className="text-6xl font-black text-[#0F5EF7] tracking-tighter">
                      {Math.round(
                        (rooms.filter((r) => r.status === 'Occupied').length / rooms.length) * 100
                      )}
                      <span className="text-2xl font-bold ml-1">%</span>
                    </h4>
                    <p className="text-sm font-medium text-[#424655] mt-2 leading-relaxed">
                      {rooms.filter((r) => r.status === 'Occupied').length} of {rooms.length} rooms currently occupied.
                    </p>
                  </>
                ) : (
                  <h4 className="text-6xl font-black text-[#0F5EF7] tracking-tighter">—</h4>
                )}
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[180px] text-blue-500/5 group-hover:text-blue-500/10 transition-all group-hover:scale-110">
                trending_up
              </span>
            </div>

            {/* Maintenance Card */}
            <div className="bespoke-card rounded-[2.5rem] p-6 flex flex-col justify-between h-[220px] relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[11px] font-extrabold text-[#424655]/50 uppercase tracking-[0.2em] mb-4">
                  Pending Maintenance
                </p>
                <h4 className="text-6xl font-black text-[#191c1e] tracking-tighter">
                  {loading
                    ? '—'
                    : String(rooms.filter((r) => r.status === 'Maintenance').length).padStart(2, '0')}
                </h4>
                <p className="text-sm font-medium text-[#424655] mt-2 leading-relaxed">
                  Rooms scheduled for routine maintenance inspection.
                </p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[180px] text-[#191c1e]/5 group-hover:text-[#191c1e]/10 transition-all group-hover:scale-110">
                engineering
              </span>
            </div>

            {/* Report / Intelligence Card */}
            <div className="bg-[#071529] rounded-[2.5rem] p-6 flex flex-col justify-between h-[240px] relative overflow-hidden group text-white border border-white/5">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-4">
                    Property Intelligence
                  </p>
                  <h4 className="text-2xl font-bold tracking-premium leading-tight">
                    Monthly Availability &amp; Forecasting Report
                  </h4>
                </div>
                <button
                  onClick={() => toast('Report generation coming soon.')}
                  className="bg-white text-[#071529] px-8 py-3 rounded-full font-black text-[11px] tracking-loose w-fit hover:bg-[#dbe1ff] transition-all flex items-center gap-2 group-hover:translate-x-1"
                >
                  GENERATE REPORT
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[200px] text-white/5 group-hover:rotate-12 transition-transform duration-700">
                analytics
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
