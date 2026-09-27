import { useEffect, useState } from 'react'
import { Thermometer, Droplets, Wind, Waves as WavesIcon, Wifi, WifiOff, RadioTower } from 'lucide-react'
import { sensorService } from '../services/sensorService.js'
import SensorCard from '../components/SensorCard.jsx'

export default function LiveMonitoring() {
  const [reading, setReading] = useState(null)
  const [device, setDevice] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const load = async () => {
    try {
      const [r, d] = await Promise.all([sensorService.getLatest(), sensorService.getDevice()])
      setReading(r)
      setDevice(d)
      setLastFetch(new Date())
    } catch (e) {
      /* toast handled globally via axios interceptor on real API */
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000) // polling — swap for a WebSocket subscription in production
    return () => clearInterval(interval)
  }, [])

  if (!reading || !device) return <div className="h-64 rounded-xl2 bg-white animate-pulse" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-navy-800/60">
          <RadioTower size={16} className="text-sky-600" />
          Auto-refreshing every 5 seconds{lastFetch && ` · last poll ${lastFetch.toLocaleTimeString()}`}
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            device.status === 'online' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {device.status === 'online' ? <Wifi size={13} /> : <WifiOff size={13} />}
          Wi-Fi: {device.wifi}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard icon={Thermometer} title="Temperature" value={reading.temperature.toFixed(1)} unit="°C" param="temperature" status={sensorService.statusFor('temperature', reading.temperature)} updatedAt="live" />
        <SensorCard icon={Droplets} title="pH" value={reading.ph.toFixed(1)} param="ph" status={sensorService.statusFor('ph', reading.ph)} updatedAt="live" />
        <SensorCard icon={Wind} title="Dissolved Oxygen" value={reading.dissolvedOxygen.toFixed(1)} unit="mg/L" param="dissolvedOxygen" status={sensorService.statusFor('dissolvedOxygen', reading.dissolvedOxygen)} updatedAt="live" />
        <SensorCard icon={WavesIcon} title="Turbidity" value={reading.turbidity.toFixed(1)} unit="NTU" param="turbidity" status={sensorService.statusFor('turbidity', reading.turbidity)} updatedAt="live" />
      </div>

      <div className="card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-navy-800/40 mb-1">Last Sensor Update</p>
          <p className="font-semibold text-navy-900">{new Date(reading.timestamp).toLocaleTimeString()}</p>
        </div>
        <div>
          <p className="text-xs text-navy-800/40 mb-1">Device Status</p>
          <p className={`font-semibold ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {device.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
        <div>
          <p className="text-xs text-navy-800/40 mb-1">Wi-Fi Status</p>
          <p className="font-semibold text-navy-900">{device.wifi}</p>
        </div>
      </div>
    </div>
  )
}
