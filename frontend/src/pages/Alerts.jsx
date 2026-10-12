import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { sensorService } from '../services/sensorService.js'
import AlertCard from '../components/AlertCard.jsx'

const SEVERITIES = ['ALL', 'INFO', 'WARNING', 'CRITICAL']

// Temporary dummy alerts for UI/demo
const DUMMY_ALERTS = [
  {
    id: 'dummy-1',
    severity: 'CRITICAL',
    title: 'Low Water Level',
    message:
      'Water level dropped to 3.2 cm in Pond 01. Aerator activated automatically.',
    createdAt: '2026-09-26T20:35:00+05:30',
    read: false,
  },
  {
    id: 'dummy-2',
    severity: 'WARNING',
    title: 'High Water Temperature',
    message:
      'Water temperature reached 31.8°C, above the configured threshold of 30°C.',
    createdAt: '2026-09-26T20:18:00+05:30',
    read: false,
  },
  {
    id: 'dummy-3',
    severity: 'WARNING',
    title: 'pH Level High',
    message:
      'pH level increased to 8.7 in Pond 01. Please monitor the water quality.',
    createdAt: '2026-09-26T19:52:00+05:30',
    read: false,
  },
  {
    id: 'dummy-4',
    severity: 'WARNING',
    title: 'Turbidity Increased',
    message:
      'Turbidity reached 7.4 NTU. Water clarity should be monitored.',
    createdAt: '2026-09-26T19:30:00+05:30',
    read: false,
  },
  {
    id: 'dummy-5',
    severity: 'INFO',
    title: 'Scheduled Feeding Completed',
    message:
      'Scheduled feeding completed successfully. Feeder operated for 10 seconds.',
    createdAt: '2026-09-26T18:30:00+05:30',
    read: true,
  },
  {
    id: 'dummy-6',
    severity: 'INFO',
    title: 'Device Reconnected',
    message:
      'ESP32 device POND-001 reconnected successfully to the monitoring system.',
    createdAt: '2026-09-26T17:45:00+05:30',
    read: true,
  },
  {
    id: 'dummy-7',
    severity: 'CRITICAL',
    title: 'Low Water Level',
    message:
      'Water level reached 2.8 cm. Emergency aeration was activated.',
    createdAt: '2026-09-26T16:20:00+05:30',
    read: true,
  },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [severity, setSeverity] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')

  const load = async () => {
    setLoading(true)

    try {
      const data = await sensorService.getAlerts()

      // Temporary: use dummy alerts when database has no alerts
      setAlerts(data?.length ? data : DUMMY_ALERTS)
    } catch (error) {
      console.error('Failed to load alerts:', error)

      // Temporary fallback for demo
      setAlerts(DUMMY_ALERTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id) => {
    // Dummy alert
    if (id.startsWith('dummy-')) {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, read: true } : alert
        )
      )
      return
    }

    await sensorService.markAlertRead(id)
    load()
  }

  const handleDelete = async (id) => {
    // Dummy alert
    if (id.startsWith('dummy-')) {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      toast.success('Alert deleted')
      return
    }

    await sensorService.deleteAlert(id)
    toast.success('Alert deleted')
    load()
  }

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (severity !== 'ALL' && a.severity !== severity) {
        return false
      }

      if (dateFilter) {
        const d = new Date(a.createdAt).toISOString().slice(0, 10)

        if (d !== dateFilter) {
          return false
        }
      }

      return true
    })
  }, [alerts, severity, dateFilter])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">
          Alerts
        </h2>

        <div className="flex flex-wrap gap-2">

          {/* Severity Filter */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-sky-100">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  severity === s
                    ? 'bg-sky-600 text-white'
                    : 'text-navy-800/60 hover:bg-sky-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field w-auto py-1.5 text-sm"
          />

        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl2 bg-white animate-pulse"
            />
          ))}
        </div>

      ) : filtered.length === 0 ? (

        /* Empty State */
        <div className="card p-12 text-center">
          <CheckCircle2
            className="mx-auto text-green-500 mb-3"
            size={36}
          />

          <p className="font-semibold text-navy-900">
            You're all caught up!
          </p>

          <p className="text-sm text-navy-800/50">
            No alerts found for the selected filter.
          </p>
        </div>

      ) : (

        /* Alerts */
        <div className="space-y-3">
          {filtered.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>

      )}
    </div>
  )
}