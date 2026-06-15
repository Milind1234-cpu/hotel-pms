import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { MdBedroomParent, MdBookOnline, MdReceipt, MdPeople } from 'react-icons/md'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    checkedIn: 0,
    totalInvoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const [roomsRes, bookingsRes, invoicesRes] = await Promise.all([
          api.get('/rooms/'),
          api.get('/bookings/'),
          api.get('/invoices/all'),
        ])
        if (!isMounted) return
        const rooms = roomsRes.data
        const bookings = bookingsRes.data
        const invoices = invoicesRes.data
        setStats({
          totalRooms: rooms.length,
          availableRooms: rooms.filter(r => r.status === 'Available').length,
          occupiedRooms: rooms.filter(r => r.status === 'Occupied').length,
          totalBookings: bookings.length,
          checkedIn: bookings.filter(b => b.status === 'Checked In').length,
          totalInvoices: invoices.length,
        })
      } catch (err) {
        if (isMounted) console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(load, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <Layout>
      {/* Dashboard Content */}
      <div className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Column */}
            <div className="col-span-12 flex flex-col gap-8">
              {/* Stats Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Rooms Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MdBedroomParent size={24} />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Rooms</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.totalRooms}</p>
                </div>

                {/* Available Rooms Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MdBedroomParent size={24} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Available</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Available Now</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.availableRooms}</p>
                </div>

                {/* Occupied Rooms Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <MdPeople size={24} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Occupied</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Occupied Rooms</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.occupiedRooms}</p>
                </div>

                {/* Total Bookings Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <MdBookOnline size={24} />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Bookings</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.totalBookings}</p>
                </div>

                {/* Checked In Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <MdPeople size={24} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Checked In</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.checkedIn}</p>
                </div>

                {/* Total Invoices Card */}
                <div className="app-card p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MdReceipt size={24} />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Invoices</p>
                  <p className="text-4xl heading-premium text-slate-900">{stats.totalInvoices}</p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
