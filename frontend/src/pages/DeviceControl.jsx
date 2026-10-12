import { useEffect, useState } from 'react'
import { Power, UtensilsCrossed, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { sensorService } from '../services/sensorService.js'

export default function DeviceControl() {
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null) // { action, label }
  const [schedule, setSchedule] = useState({ time: '06:00', duration: 30, enabled: true })

  const load = async () => {
    setLoading(true)
    try {
      const nextDevice = await sensorService.getDevice()
      setDevice(nextDevice)
      setSchedule(nextDevice.aeratorSchedule || { time: '06:00', duration: 30, enabled: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const runConfirmed = async () => {
    if (!confirm) return
    setBusy(true)
    try {
      if (confirm.action === 'toggleAerator') {
        const next = device.aerator === 'on' ? 'off' : 'on'
        await sensorService.sendCommand('aerator', next)
        toast.success(`Aerator turned ${next.toUpperCase()} successfully`)
      } else if (confirm.action === 'feedNow') {
        await sensorService.feedNow()
        toast.success('Feeder activated successfully')
      } else if (confirm.action === 'syncTime') {
        await sensorService.sendCommand('syncTime')
        toast.success('Device time synced successfully')
      }
      await load()
    } catch (err) {
      toast.error(err.message || 'Command failed')
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const setControlMode = async (mode) => {
    try {
      await sensorService.sendCommand('controlMode', mode)
      toast.success(`Control mode set to ${mode}`)
      load()
    } catch (err) {
      toast.error(err.message || 'Command failed')
    }
  }

  const saveSchedule = async (event) => {
    event.preventDefault()
    if (!schedule.time || schedule.duration < 1 || schedule.duration > 3600) {
      toast.error('Set a valid time and duration between 1 and 3600 seconds')
      return
    }

    setBusy(true)
    try {
      await sensorService.sendCommand('aeratorSchedule', {
        time: schedule.time,
        duration: Number(schedule.duration),
        enabled: schedule.enabled,
      })
      toast.success('Aerator schedule saved')
      await load()
    } catch (err) {
      toast.error(err.message || 'Unable to save aerator schedule')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !device) return <div className="h-64 rounded-xl2 bg-white animate-pulse" />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aerator */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-navy-900">Aerator Control</h3>
            <span className={`badge ${device.aerator === 'on' ? 'badge-good' : 'badge-neutral'}`}>
              {device.aerator === 'on' ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl2 flex items-center justify-center ${device.aerator === 'on' ? 'bg-green-50 text-green-600' : 'bg-sky-50 text-sky-600'}`}>
              <Power size={26} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-navy-800/60">Status: <span className="font-semibold text-navy-900">{device.aerator === 'on' ? 'ON' : 'OFF'}</span></p>
              <button
                disabled={device.controlMode === 'automatic'}
                onClick={() => setConfirm({ action: 'toggleAerator', label: `turn ${device.aerator === 'on' ? 'OFF' : 'ON'} the aerator` })}
                className={device.aerator === 'on' ? 'btn-danger mt-2' : 'btn-primary mt-2'}
              >
                Turn {device.aerator === 'on' ? 'OFF' : 'ON'}
              </button>
              {device.controlMode === 'automatic' && (
                <p className="text-xs text-navy-800/40 mt-1.5">Switch to Manual mode to control directly.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sky-100">
            <p className="text-sm font-medium text-navy-800 mb-2.5">Control Mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => setControlMode('manual')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  device.controlMode === 'manual' ? 'bg-sky-600 text-white border-sky-600' : 'border-sky-200 text-navy-800/60 hover:bg-sky-50'
                }`}
              >
                ○ Manual
              </button>
              <button
                onClick={() => setControlMode('automatic')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  device.controlMode === 'automatic' ? 'bg-sky-600 text-white border-sky-600' : 'border-sky-200 text-navy-800/60 hover:bg-sky-50'
                }`}
              >
                ● Automatic
              </button>
            </div>
            <p className="text-xs text-navy-800/40 mt-2">
              Automatic mode runs the aerator only at the scheduled time and for the scheduled duration.
            </p>
            <form onSubmit={saveSchedule} className="mt-4 pt-4 border-t border-sky-100 space-y-3">
              <p className="text-sm font-medium text-navy-800">Automatic schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-navy-800/60">
                  Start time
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(event) => setSchedule({ ...schedule, time: event.target.value })}
                    className="input-field mt-1"
                    disabled={busy}
                  />
                </label>
                <label className="text-xs text-navy-800/60">
                  Duration (seconds)
                  <input
                    type="number"
                    min="1"
                    max="3600"
                    value={schedule.duration}
                    onChange={(event) => setSchedule({ ...schedule, duration: Number(event.target.value) })}
                    className="input-field mt-1"
                    disabled={busy}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-navy-800/70">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(event) => setSchedule({ ...schedule, enabled: event.target.checked })}
                  disabled={busy}
                />
                Enable daily schedule
              </label>
              <button type="submit" disabled={busy} className="btn-secondary">
                {busy ? 'Saving...' : 'Save Schedule'}
              </button>
            </form>
          </div>
        </div>

        {/* Feeder */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-navy-900"> Feeder Control</h3>
            <span className="badge badge-good capitalize">{device.feeder.status}</span>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl2 bg-sky-50 text-sky-600 flex items-center justify-center">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <p className="text-sm text-navy-800/60">Last Feeding</p>
              <p className="font-semibold text-navy-900">{new Date(device.feeder.lastFeeding).toLocaleString()}</p>
            </div>
          </div>
          <button
            disabled={busy}
            onClick={() => setConfirm({ action: 'feedNow', label: 'activate the feeder now' })}
            className="btn-primary w-full"
          >
            Feed Now
          </button>
        </div>
      </div>

      {/* RTC */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-navy-800/60 mb-1">Device Time (RTC)</p>
          <p className="font-semibold text-navy-900 text-lg">{new Date(device.rtc).toLocaleString()}</p>
        </div>
        <button
          onClick={() => setConfirm({ action: 'syncTime', label: 'sync the device clock' })}
          className="btn-secondary"
        >
          <RefreshCw size={15} /> Sync Device Time
        </button>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-navy-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl2 w-full max-w-sm p-6 relative">
            <button onClick={() => setConfirm(null)} className="absolute top-4 right-4 text-navy-800/40">
              <X size={18} />
            </button>
            <h3 className="font-semibold text-navy-900 mb-2">Confirm action</h3>
            <p className="text-sm text-navy-800/70 mb-5">Are you sure you want to {confirm.label}?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={runConfirmed} disabled={busy} className="btn-primary flex-1">
                {busy ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
