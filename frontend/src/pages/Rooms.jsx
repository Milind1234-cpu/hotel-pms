import { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [typeFilter, setTypeFilter] = useState('Room Type')
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    price_per_night: '',
    status: 'Available',
    description: ''
  })

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms/')
      setRooms(res.data)
    } catch {
      toast.error('Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const openAddModal = () => {
    setEditMode(false)
    setCurrentRoom(null)
    setFormData({
      room_number: '',
      room_type: 'Standard',
      price_per_night: '',
      status: 'Available',
      description: ''
    })
    setShowModal(true)
  }

  const openEditModal = (room) => {
    setEditMode(true)
    setCurrentRoom(room)
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      status: room.status,
      description: room.description || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const price = parseFloat(formData.price_per_night)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price per night')
      return
    }
    const payload = { ...formData, price_per_night: price }
    try {
      if (editMode) {
        await api.put(`/rooms/${currentRoom.id}`, payload)
        toast.success('Room updated successfully!')
      } else {
        await api.post('/rooms/', payload)
        toast.success('Room added successfully!')
      }
      setShowModal(false)
      fetchRooms()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    try {
      await api.delete(`/rooms/${roomId}`)
      toast.success('Room deleted successfully!')
      fetchRooms()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'Standard': return 'bg-blue-100 text-blue-800'
      case 'Deluxe': return 'bg-purple-100 text-purple-800'
      case 'Suite': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-500 text-white status-glow-available'
      case 'Occupied': return 'bg-red-500 text-white status-glow-occupied'
      case 'Maintenance': return 'bg-orange-400 text-white status-glow-maintenance'
      default: return 'bg-gray-400 text-white'
    }
  }

  // Derived stats from rooms data
  const totalRooms = rooms.length
  const availableRooms = rooms.filter(r => r.status === 'Available').length
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // Filtered rooms based on search/filter
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      searchQuery === '' ||
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'All Status' || room.status === statusFilter
    const matchesType =
      typeFilter === 'Room Type' || room.room_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <Layout>
      <div className="p-xl space-y-xl max-w-[1440px] mx-auto w-full">

        {/* Breadcrumbs & Header */}
        <section className="space-y-sm">
          <nav className="flex text-label-sm font-label-sm text-on-surface-variant gap-2 items-center" style={{ opacity: 0.6 }}>
            <span>Dashboard</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-on-surface-variant">Rooms</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display-lg text-headline-lg text-on-surface font-extrabold flex items-center gap-4">
                Rooms Management
                <div className="h-8 w-1.5 rounded-full blue-gradient"></div>
              </h2>
              <div className="flex gap-md mt-2 text-on-surface-variant font-label-md text-label-md flex-wrap">
                <span>Total Inventory: <strong className="text-on-surface">{totalRooms}</strong></span>
                <span className="text-outline-variant">•</span>
                <span>Available: <strong className="text-secondary">{availableRooms}</strong></span>
                <span className="text-outline-variant">•</span>
                <span>In Maintenance: <strong className="text-error">{maintenanceRooms}</strong></span>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-lg py-3 blue-gradient text-white rounded-xl flex items-center gap-2 font-label-md text-label-md shadow-lg hover:scale-[1.02] transition-all active:scale-95"
            >
              <MdAdd size={20} />
              Create Room
            </button>
          </div>
        </section>

        {/* Executive Stats Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-lg">
          {/* Total Rooms */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">bed</span>
              </div>
              <span className="text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full h-fit">Total</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Total Rooms</p>
            <p className="text-headline-md font-headline-md text-on-surface">{totalRooms}</p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full blue-gradient w-full"></div>
            </div>
          </div>

          {/* Available */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <span className="text-[11px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full h-fit">Live</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Available</p>
            <p className="text-headline-md font-headline-md text-on-surface">{availableRooms}</p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: totalRooms > 0 ? `${Math.round((availableRooms / totalRooms) * 100)}%` : '0%' }}
              ></div>
            </div>
          </div>

          {/* Occupied */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">hotel</span>
              </div>
              <span className="text-[11px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full h-fit">Live</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Occupied</p>
            <p className="text-headline-md font-headline-md text-on-surface">{occupiedRooms}</p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: totalRooms > 0 ? `${Math.round((occupiedRooms / totalRooms) * 100)}%` : '0%' }}
              ></div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600">engineering</span>
              </div>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full h-fit">Alert</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Maintenance</p>
            <p className="text-headline-md font-headline-md text-on-surface">{maintenanceRooms}</p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: totalRooms > 0 ? `${Math.round((maintenanceRooms / totalRooms) * 100)}%` : '0%' }}
              ></div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600">analytics</span>
              </div>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full h-fit">Rate</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Occupancy</p>
            <p className="text-headline-md font-headline-md text-on-surface">{occupancyPct}%</p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${occupancyPct}%` }}
              ></div>
            </div>
          </div>

          {/* Standard / Deluxe / Suite counts */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 card-lift shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">category</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full h-fit">Types</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Room Types</p>
            <p className="text-headline-md font-headline-md text-on-surface">
              {[...new Set(rooms.map(r => r.room_type))].length}
            </p>
            <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-full"></div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col lg:flex-row gap-lg items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Search by Room Number or Type..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-md w-full lg:w-auto flex-wrap">
            <select
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-label-md font-label-md focus:ring-2 focus:ring-primary outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>
            <select
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-label-md font-label-md focus:ring-2 focus:ring-primary outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option>Room Type</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All Status'); setTypeFilter('Room Type') }}
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 flex items-center gap-2 text-label-md font-label-md hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
              Clear Filters
            </button>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <p className="text-on-surface-variant font-label-md text-label-md">Loading rooms...</p>
            </div>
          </div>
        )}

        {/* Room Inventory Grid */}
        {!loading && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xl">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 card-lift shadow-sm group"
              >
                {/* Card Header - Color band based on room type */}
                <div className="relative h-16 flex items-center justify-between px-lg"
                  style={{
                    background: room.room_type === 'Suite'
                      ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                      : room.room_type === 'Deluxe'
                        ? 'linear-gradient(135deg, #0F5EF7 0%, #0A4DDB 100%)'
                        : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                        {room.room_type === 'Suite' ? 'king_bed' : room.room_type === 'Deluxe' ? 'bedroom_parent' : 'bed'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-body-md leading-none">Room {room.room_number}</p>
                      <p className="text-white/70 text-label-sm">{room.room_type}</p>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg">
                    <span className="text-headline-sm font-headline-sm" style={{
                      color: room.room_type === 'Suite' ? '#7c3aed' : room.room_type === 'Deluxe' ? '#0F5EF7' : '#0891b2'
                    }}>
                      ₹{Number(room.price_per_night).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase ml-1">/ Night</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-lg space-y-md">
                  {/* Status Badge Row */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRoomTypeColor(room.room_type)}`}>
                      {room.room_type}
                    </span>
                  </div>

                  {/* Description */}
                  {room.description && (
                    <div className="py-2 border-y border-outline-variant/10">
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">{room.description}</p>
                    </div>
                  )}

                  {!room.description && (
                    <div className="flex gap-4 py-2 border-y border-outline-variant/10">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>wifi</span>
                        <span className="text-label-sm">WiFi</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>ac_unit</span>
                        <span className="text-label-sm">AC</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tv</span>
                        <span className="text-label-sm">Smart TV</span>
                      </div>
                    </div>
                  )}

                  {/* Price Detail */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Price / Night</p>
                      <p className="text-body-md font-bold text-on-surface">
                        ₹{Number(room.price_per_night).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Room No.</p>
                      <p className="text-body-md font-bold text-on-surface">{room.room_number}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-md pt-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 blue-gradient text-white rounded-xl font-label-md text-label-md shadow-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      <MdEdit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="px-md py-2.5 flex items-center justify-center gap-2 bg-error/10 hover:bg-error/20 text-error border border-error/20 rounded-xl font-label-md text-label-md transition-all"
                    >
                      <MdDelete size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Room Card (empty state / CTA) */}
            <div
              onClick={openAddModal}
              className="bg-surface-container/30 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-xl text-center space-y-md group cursor-pointer hover:bg-surface-container/50 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>add_home</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Add New Room</h4>
                <p className="text-body-sm text-on-surface-variant mt-2 max-w-[200px]">
                  Expand your inventory with a new room or suite.
                </p>
              </div>
              <button className="px-lg py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-label-md text-label-md hover:bg-primary/20 transition-all">
                <MdAdd size={16} className="inline mr-1" />
                Create Room
              </button>
            </div>
          </section>
        )}

        {/* Empty State — no rooms at all */}
        {!loading && rooms.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-16 flex flex-col items-center justify-center text-center gap-md">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>bed</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">No rooms found</h3>
              <p className="text-body-sm text-on-surface-variant mt-2">Add your first room to get started.</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-lg py-3 blue-gradient text-white rounded-xl flex items-center gap-2 font-label-md text-label-md shadow-lg mt-2 hover:scale-[1.02] transition-all active:scale-95"
            >
              <MdAdd size={20} />
              Add First Room
            </button>
          </div>
        )}

        {/* Empty filtered results */}
        {!loading && rooms.length > 0 && filteredRooms.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-md">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>search_off</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">No rooms match your filters</h3>
              <p className="text-body-sm text-on-surface-variant mt-2">Try adjusting the search or filter criteria.</p>
            </div>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All Status'); setTypeFilter('Room Type') }}
              className="px-lg py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-label-md text-label-md hover:bg-primary/20 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/20 overflow-hidden">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-lg border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center shadow-lg">
                  {editMode
                    ? <MdEdit size={20} className="text-white" />
                    : <MdAdd size={20} className="text-white" />
                  }
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    {editMode ? 'Edit Room' : 'Add New Room'}
                  </h2>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    {editMode ? `Editing Room ${currentRoom?.room_number}` : 'Fill in room details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-lg space-y-md">
              {/* Room Number */}
              <div>
                <label htmlFor="room_number" className="block text-label-md font-label-md text-on-surface mb-1">
                  Room Number
                </label>
                <input
                  id="room_number"
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g. 101"
                />
              </div>

              {/* Room Type */}
              <div>
                <label htmlFor="room_type" className="block text-label-md font-label-md text-on-surface mb-1">
                  Room Type
                </label>
                <select
                  id="room_type"
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Price per Night */}
              <div>
                <label htmlFor="price_per_night" className="block text-label-md font-label-md text-on-surface mb-1">
                  Price per Night (₹)
                </label>
                <input
                  id="price_per_night"
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  required
                  min="0"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g. 2000"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-label-md font-label-md text-on-surface mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-label-md font-label-md text-on-surface mb-1">
                  Description <span className="text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                  placeholder="Room features and amenities..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-md pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl font-label-md text-label-md transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 blue-gradient text-white rounded-xl font-label-md text-label-md shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  {editMode ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
