import { AlertTriangle, XCircle, Info, Check, Trash2 } from 'lucide-react'

const SEVERITY = {
  INFO: { icon: Info, className: 'text-sky-600 bg-sky-50 border-sky-200' },
  WARNING: { icon: AlertTriangle, className: 'text-amber-600 bg-amber-50 border-amber-200' },
  CRITICAL: { icon: XCircle, className: 'text-red-600 bg-red-50 border-red-200' },
}

export default function AlertCard({ alert, onMarkRead, onDelete }) {
  const cfg = SEVERITY[alert.severity] || SEVERITY.INFO
  const Icon = cfg.icon

  return (
    <div className={`card p-4 flex items-start gap-3 ${!alert.read ? 'border-l-4' : ''}`}>
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${cfg.className}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-navy-900 text-sm">{alert.message.split('.')[0]}</h4>
          {!alert.read && <span className="w-2 h-2 rounded-full bg-sky-500" />}
        </div>
        <p className="text-sm text-navy-800/70 mt-0.5">{alert.message}</p>
        <p className="text-xs text-navy-800/40 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!alert.read && (
          <button
            onClick={() => onMarkRead(alert.id)}
            title="Mark as read"
            className="w-8 h-8 rounded-lg hover:bg-sky-50 flex items-center justify-center text-sky-600"
          >
            <Check size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(alert.id)}
          title="Delete alert"
          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
