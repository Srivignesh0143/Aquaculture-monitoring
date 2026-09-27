const CONFIG = {
  good: { label: 'Normal', className: 'badge-good' },
  optimal: { label: 'Optimal', className: 'badge-good' },
  healthy: { label: 'Healthy', className: 'badge-good' },
  warning: { label: 'Warning', className: 'badge-warn' },
  critical: { label: 'Critical', className: 'badge-bad' },
  unknown: { label: 'Unknown', className: 'badge-neutral' },
}

export default function StatusBadge({ status, label }) {
  const cfg = CONFIG[status] || CONFIG.unknown
  return <span className={`badge ${cfg.className}`}>{label || cfg.label}</span>
}
