import { useEffect, useMemo, useState } from 'react'
import { Download, Inbox } from 'lucide-react'
import { sensorService } from '../services/sensorService.js'
import StatusBadge from '../components/StatusBadge.jsx'

const RANGES = [
  { key: '24h', label: 'Last 1 Day' },
  { key: '7d', label: 'Last 1 Week' },
  { key: '30d', label: 'Last 1 Month' },
]

function toCSV(rows) {
  const header = 'Time,Temperature (°C),pH,Water Level (cm),Turbidity (NTU)\n'
  const body = rows
    .map((r) => `${new Date(r.timestamp).toLocaleString()},${r.temperature},${r.ph},${r.waterLevel},${r.turbidity}`)
    .join('\n')
  return header + body
}

function normalizeReading(reading) {
  return {
    ...reading,
    waterLevel: Number(reading.waterLevel ?? reading.dissolvedOxygen ?? 0),
  }
}

export default function HistoricalData() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('7d')
  const [date, setDate] = useState('')
  const [sensor, setSensor] = useState('all')

  useEffect(() => {
    setLoading(true)
    setError('')
    sensorService
      .getHistory(range)
      .then((h) => setRows((Array.isArray(h) ? h : []).map(normalizeReading).reverse()))
      .catch((err) => setError(err.message || 'Unable to load historical data'))
      .finally(() => setLoading(false))
  }, [range])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (date && new Date(r.timestamp).toISOString().slice(0, 10) !== date) return false
      return true
    })
  }, [rows, date])

  const handleExport = () => {
    const csv = toCSV(filtered)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sensor-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Historical Data</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="input-field w-auto py-1.5 text-sm">
            {RANGES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto py-1.5 text-sm" />
          <select value={sensor} onChange={(e) => setSensor(e.target.value)} className="input-field w-auto py-1.5 text-sm">
            <option value="all">All Sensors</option>
            <option value="temperature">Temperature</option>
            <option value="ph">pH</option>
            <option value="waterLevel">Water Level</option>
            <option value="turbidity">Turbidity</option>
          </select>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-sky-50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="mx-auto text-navy-800/20 mb-3" size={36} />
            <p className="font-medium text-navy-900">{error || 'No sensor data available'}</p>
            <p className="text-sm text-navy-800/50">
              {error ? 'Check the device connection and try again.' : 'Waiting for the IoT device to send readings.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-navy-800/50 border-b border-sky-100">
                  <th className="px-5 py-3 font-medium">Time</th>
                  {(sensor === 'all' || sensor === 'temperature') && <th className="px-5 py-3 font-medium">Temperature</th>}
                  {(sensor === 'all' || sensor === 'ph') && <th className="px-5 py-3 font-medium">pH</th>}
                  {(sensor === 'all' || sensor === 'waterLevel') && <th className="px-5 py-3 font-medium">Water Level</th>}
                  {(sensor === 'all' || sensor === 'turbidity') && <th className="px-5 py-3 font-medium">Turbidity</th>}
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 300).map((r, idx) => (
                  <tr key={idx} className="border-b border-sky-50 last:border-0">
                    <td className="px-5 py-2.5 text-navy-800/70">{new Date(r.timestamp).toLocaleString()}</td>
                    {(sensor === 'all' || sensor === 'temperature') && <td className="px-5 py-2.5 font-medium text-navy-900">{Number(r.temperature).toFixed(1)}°C</td>}
                    {(sensor === 'all' || sensor === 'ph') && <td className="px-5 py-2.5 font-medium text-navy-900">{Number(r.ph).toFixed(1)}</td>}
                    {(sensor === 'all' || sensor === 'waterLevel') && <td className="px-5 py-2.5 font-medium text-navy-900">{r.waterLevel.toFixed(1)} cm</td>}
                    {(sensor === 'all' || sensor === 'turbidity') && <td className="px-5 py-2.5 font-medium text-navy-900">{Number(r.turbidity).toFixed(1)}</td>}
                    <td className="px-5 py-2.5">
                      <StatusBadge status={sensorService.statusFor('temperature', r.temperature)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
