import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard,
  MdBedroomParent,
  MdBookOnline,
  MdLogin,
  MdReceipt,
  MdCalendarMonth,
  MdLogout
} from 'react-icons/md'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={22} /> },
  { to: '/rooms', label: 'Rooms', icon: <MdBedroomParent size={22} /> },
  { to: '/bookings', label: 'Bookings', icon: <MdBookOnline size={22} /> },
  { to: '/checkin', label: 'Check-In / Out', icon: <MdLogin size={22} /> },
]

const operationsLinks = [
  { to: '/invoice', label: 'Invoices', icon: <MdReceipt size={22} /> },
  { to: '/calendar', label: 'Calendar', icon: <MdCalendarMonth size={22} /> },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] sidebar-gradient text-white flex flex-col justify-between py-8 px-6 border-r border-white/5 z-50 print:hidden">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-4 mb-[60px] px-4">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}
            >
              hotel
            </span>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold tracking-tight text-white heading-premium">Hotel PMS</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold">Excellence Suite</p>
          </div>
        </div>

        {/* User Context */}
        <div className="mb-8 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Authorized User</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide">{user?.name}</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          </div>
          <p className="text-xs text-white/30 font-light capitalize">{user?.role}</p>
        </div>

        {/* Navigation Links — Management */}
        <nav className="space-y-1">
          <p className="px-4 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Management</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'nav-link-active font-semibold tracking-wide'
                    : 'text-white/50 hover:text-white hover:bg-white/5 font-medium'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}

          {/* Operations sub-section */}
          <p className="px-4 pt-6 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Operations</p>
          {operationsLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'nav-link-active font-semibold tracking-wide'
                    : 'text-white/50 hover:text-white hover:bg-white/5 font-medium'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-white/5 pt-6">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
        >
          <MdLogout size={22} />
          <span className="font-semibold tracking-wide">Log Out</span>
        </button>
      </div>
    </aside>
  )
}
