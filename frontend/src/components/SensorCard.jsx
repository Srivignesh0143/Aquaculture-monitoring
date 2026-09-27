import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

const STATUS_LABELS = {
  temperature: { good: 'Normal', warning: 'Warning', critical: 'Critical' },
  ph: { good: 'Optimal', warning: 'Warning', critical: 'Critical' },
  dissolvedOxygen: { good: 'Healthy', warning: 'Warning', critical: 'Critical' },
  turbidity: { good: 'Normal', warning: 'Warning', critical: 'Critical' },
}

export default function SensorCard({ icon: Icon, title, value, unit, status, param, trend, updatedAt }) {
  const label = STATUS_LABELS[param]?.[status]

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Icon size={18} strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-navy-800">{title}</span>
        </div>
        {trend === 'up' && <TrendingUp size={16} className="text-amber-500" />}
        {trend === 'down' && <TrendingDown size={16} className="text-sky-500" />}
        {trend === 'flat' && <Minus size={16} className="text-navy-800/30" />}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-navy-900 tracking-tight">{value}</span>
        {unit && <span className="text-sm text-navy-800/60 mb-1">{unit}</span>}
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={status} label={label} />
        {updatedAt && <span className="text-xs text-navy-800/40">{updatedAt}</span>}
      </div>
    </div>
  )
}
