import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  LineChart,
  UtensilsCrossed,
  Sliders,
  Bell,
  History,
  Settings as SettingsIcon,
  User,
  LogOut,
  Waves,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/live-monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/feeding-schedule', label: 'Feeding Schedule', icon: UtensilsCrossed },
  { to: '/device-control', label: 'Device Control', icon: Sliders },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/data-sync', label: 'Data Sync', icon: Sliders },
  { to: '/historical-data', label: 'Historical Data', icon: History },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-navy-800/70 hover:bg-sky-50 hover:text-navy-900'
    }`

  return (
    <>
      {open && <div className="fixed inset-0 bg-navy-950/40 z-30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-white border-r border-sky-100 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Waves size={19} />
            </div>
            <div>
              <p className="font-bold text-navy-900 leading-tight text-sm">Aquaculture</p>
              <p className="text-xs text-navy-800/50 leading-tight">Monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-navy-800/50">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-sky-100 space-y-1">
          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            <SettingsIcon size={18} />
            Settings
          </NavLink>
          
        </div>
      </aside>
    </>
  )
}
