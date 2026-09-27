import { useEffect, useMemo, useState } from 'react'
import { Download, Inbox } from 'lucide-react'
import { sensorService } from '../services/sensorService.js'
import StatusBadge from '../components/StatusBadge.jsx'

function toCSV(rows) {
  const header = 'Time,Temperature (°C),pH,Dissolved Oxygen (mg/L),Turbidity (NTU)\n'
  const body = rows
    .map((r) => `${new Date(r.timestamp).toLocaleString()},${r.temperature},${r.ph},${r.dissolvedOxygen},${r.turbidity}`)
    .join('\n')
  return header + body
}

export default function HistoricalData() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [sensor, setSensor] = useState('all')

  useEffect(() => {
    setLoading(true)
    sensorService
      .getHistory('7d')
      .then((h) => setRows(h.slice().reverse()))
      .finally(() => setLoading(false))
  }, [])

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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto py-1.5 text-sm" />
          <select value={sensor} onChange={(e) => setSensor(e.target.value)} className="input-field w-auto py-1.5 text-sm">
            <option value="all">All Sensors</option>
            <option value="temperature">Temperature</option>
            <option value="ph">pH</option>
            <option value="dissolvedOxygen">Dissolved Oxygen</option>
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
            <p className="font-medium text-navy-900">No sensor data available</p>
            <p className="text-sm text-navy-800/50">Waiting for the IoT device to send readings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-navy-800/50 border-b border-sky-100">
                  <th className="px-5 py-3 font-medium">Time</th>
                  {(sensor === 'all' || sensor === 'temperature') && <th className="px-5 py-3 font-medium">Temperature</th>}
                  {(sensor === 'all' || sensor === 'ph') && <th className="px-5 py-3 font-medium">pH</th>}
                  {(sensor === 'all' || sensor === 'dissolvedOxygen') && <th className="px-5 py-3 font-medium">DO</th>}
                  {(sensor === 'all' || sensor === 'turbidity') && <th className="px-5 py-3 font-medium">Turbidity</th>}
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 300).map((r, idx) => (
                  <tr key={idx} className="border-b border-sky-50 last:border-0">
                    <td className="px-5 py-2.5 text-navy-800/70">{new Date(r.timestamp).toLocaleString()}</td>
                    {(sensor === 'all' || sensor === 'temperature') && <td className="px-5 py-2.5 font-medium text-navy-900">{r.temperature.toFixed(1)}°C</td>}
                    {(sensor === 'all' || sensor === 'ph') && <td className="px-5 py-2.5 font-medium text-navy-900">{r.ph.toFixed(1)}</td>}
                    {(sensor === 'all' || sensor === 'dissolvedOxygen') && <td className="px-5 py-2.5 font-medium text-navy-900">{r.dissolvedOxygen.toFixed(1)}</td>}
                    {(sensor === 'all' || sensor === 'turbidity') && <td className="px-5 py-2.5 font-medium text-navy-900">{r.turbidity.toFixed(1)}</td>}
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
