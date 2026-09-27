import { useEffect, useState } from 'react'
import { Thermometer, Droplets, Wind, Waves as WavesIcon, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { sensorService } from '../services/sensorService.js'
import SensorCard from '../components/SensorCard.jsx'

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  return `${Math.floor(diff / 3600)} hours ago`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [reading, setReading] = useState(null)
  const [device, setDevice] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    try {
      const [r, d, a] = await Promise.all([
        sensorService.getLatest(),
        sensorService.getDevice(),
        sensorService.getAnalytics(),
      ])
      setReading(r)
      setDevice(d)
      setHealth(a)
    } catch (e) {
      /* handled by toast interceptors elsewhere */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 15000)
    return () => clearInterval(interval)
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const healthColor = health?.healthLabel === 'Excellent' || health?.healthLabel === 'Good'
    ? '#16a34a'
    : health?.healthLabel === 'Warning'
    ? '#e69500'
    : '#dc2626'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl2 bg-white animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl2 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-navy-900">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-navy-800/60 text-sm mt-0.5">Aquaculture Monitoring Overview</p>
          <p className="text-xs text-navy-800/40 mt-1">Last updated: {timeAgo(reading?.timestamp)}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium w-fit ${
            device?.status === 'online' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {device?.status === 'online' ? <Wifi size={15} /> : <WifiOff size={15} />}
          Device {device?.status === 'online' ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard
          icon={Thermometer}
          title="Water Temperature"
          value={reading.temperature.toFixed(1)}
          unit="°C"
          param="temperature"
          status={sensorService.statusFor('temperature', reading.temperature)}
          updatedAt="Just now"
        />
        <SensorCard
          icon={Droplets}
          title="pH Level"
          value={reading.ph.toFixed(1)}
          param="ph"
          status={sensorService.statusFor('ph', reading.ph)}
          updatedAt="Just now"
        />
        <SensorCard
          icon={Wind}
          title="Dissolved Oxygen"
          value={reading.dissolvedOxygen.toFixed(1)}
          unit="mg/L"
          param="dissolvedOxygen"
          status={sensorService.statusFor('dissolvedOxygen', reading.dissolvedOxygen)}
          updatedAt="Just now"
        />
        <SensorCard
          icon={WavesIcon}
          title="Turbidity"
          value={reading.turbidity.toFixed(1)}
          unit="NTU"
          param="turbidity"
          status={sensorService.statusFor('turbidity', reading.turbidity)}
          updatedAt="Just now"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col items-center justify-center lg:col-span-1">
          <p className="text-sm font-medium text-navy-800/60 mb-4">Pond Health</p>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e0f1fe" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={healthColor}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - health.healthScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-navy-900">{health.healthScore}%</span>
            </div>
          </div>
          <p className="mt-4 font-semibold" style={{ color: healthColor }}>
            {health.healthLabel}
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="text-sm font-medium text-navy-800/60 mb-4">{device.deviceId} — Device Status</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-navy-800/40 mb-1">Status</p>
              <p className={`font-semibold ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-800/40 mb-1">Last Seen</p>
              <p className="font-semibold text-navy-900">{timeAgo(device.lastSeen)}</p>
            </div>
            <div>
              <p className="text-xs text-navy-800/40 mb-1">Wi-Fi</p>
              <p className="font-semibold text-navy-900">{device.wifi}</p>
            </div>
            <div>
              <p className="text-xs text-navy-800/40 mb-1">Sensors</p>
              <p className="font-semibold text-navy-900">
                {device.sensorsActive}/{device.sensorsTotal} Active
              </p>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-sky-100 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-navy-800/50">Aerator:</span>
              <span className={`font-semibold ${device.aerator === 'on' ? 'text-green-600' : 'text-navy-800/60'}`}>
                {device.aerator.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-navy-800/50">Feeder:</span>
              <span className="font-semibold text-navy-900 capitalize">{device.feeder.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-navy-800/50">Control Mode:</span>
              <span className="font-semibold text-navy-900 capitalize">{device.controlMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
