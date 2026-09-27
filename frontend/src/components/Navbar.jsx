import { useEffect, useRef, useState } from 'react'
import { Menu, Bell, Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { sensorService } from '../services/sensorService.js'
import { Link } from 'react-router-dom'

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [deviceOnline, setDeviceOnline] = useState(true)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [alertList, device] = await Promise.all([sensorService.getAlerts(), sensorService.getDevice()])
        if (!mounted) return
        setAlerts(alertList.filter((a) => !a.read))
        setDeviceOnline(device.status === 'online')
      } catch (e) {
        /* silent - navbar shouldn't block the UI */
      }
    }
    load()
    const interval = setInterval(load, 20000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-sky-100">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-navy-800 -ml-1 p-1">
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-navy-900 text-base lg:text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100">
            {deviceOnline ? (
              <>
                <Wifi size={13} className="text-green-600" />
                <span className="text-green-700">Device Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="text-red-600" />
                <span className="text-red-700">Device Offline</span>
              </>
            )}
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((s) => !s)}
              className="relative w-9 h-9 rounded-lg hover:bg-sky-50 flex items-center justify-center text-navy-800"
            >
              <Bell size={19} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 card p-2 z-30">
                {alerts.length === 0 ? (
                  <p className="text-sm text-navy-800/50 text-center py-4">No new notifications</p>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div key={a.id} className="px-3 py-2.5 rounded-lg hover:bg-sky-50">
                      <p className="text-sm font-medium text-navy-900">{a.message.split('.')[0]}</p>
                      <p className="text-xs text-navy-800/40 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
                <Link
                  to="/alerts"
                  onClick={() => setShowNotifs(false)}
                  className="block text-center text-xs font-medium text-sky-600 py-2 mt-1 hover:underline"
                >
                  View all alerts
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile((s) => !s)} className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <span className="hidden md:block text-sm font-medium text-navy-900">{user?.name}</span>
              <ChevronDown size={15} className="hidden md:block text-navy-800/40" />
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-44 card p-1.5 z-30">
                <Link to="/profile" onClick={() => setShowProfile(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-sky-50 text-navy-800">
                  Profile
                </Link>
                <Link to="/settings" onClick={() => setShowProfile(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-sky-50 text-navy-800">
                  Settings
                </Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-500">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
