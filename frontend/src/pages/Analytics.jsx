import { useEffect, useState } from 'react'
import { sensorService } from '../services/sensorService.js'
import ChartCard from '../components/ChartCard.jsx'

const RANGES = [
  { key: '1h', label: 'Last Hour' },
  { key: '24h', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
]

const PARAMS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#0e94e3' },
  { key: 'ph', label: 'pH', unit: '', color: '#16a34a' },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L', color: '#0275c1' },
  { key: 'turbidity', label: 'Turbidity', unit: 'NTU', color: '#e69500' },
]

export default function Analytics() {
  const [range, setRange] = useState('24h')
  const [selectedParam, setSelectedParam] = useState('temperature')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    sensorService
      .getHistory(range)
      .then(setHistory)
      .finally(() => setLoading(false))
  }, [range])

  const activeParam = PARAMS.find((p) => p.key === selectedParam)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Sensor Analytics</h2>
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-lg border border-sky-100">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r.key ? 'bg-sky-600 text-white' : 'text-navy-800/60 hover:bg-sky-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl2 bg-white animate-pulse" />
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <h3 className="font-semibold text-navy-900">Water Quality Trends</h3>
              <select
                value={selectedParam}
                onChange={(e) => setSelectedParam(e.target.value)}
                className="input-field w-auto py-2 text-sm"
              >
                {PARAMS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <ChartCard
              title={activeParam.label}
              data={history}
              dataKey={activeParam.key}
              unit={activeParam.unit}
              color={activeParam.color}
              height={320}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PARAMS.map((p) => (
              <ChartCard key={p.key} title={`Time vs ${p.label}`} data={history} dataKey={p.key} unit={p.unit} color={p.color} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
