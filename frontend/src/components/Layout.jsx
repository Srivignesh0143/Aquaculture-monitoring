import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

const TITLES = {
  '/': 'Dashboard',
  '/live-monitoring': 'Live Monitoring',
  '/analytics': 'Sensor Analytics',
  '/feeding-schedule': 'Feeding Schedule',
  '/device-control': 'Device Control',
  '/alerts': 'Alerts',
  '/historical-data': 'Historical Data',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-sky-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
