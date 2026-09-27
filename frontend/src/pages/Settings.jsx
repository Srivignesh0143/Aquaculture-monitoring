import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { sensorService } from '../services/sensorService.js'

const TABS = ['Profile', 'Sensor Thresholds', 'Notifications']

export default function Settings() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState('Profile')
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [thresholds, setThresholds] = useState(null)
  const [notifications, setNotifications] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email, phone: user.phone })
    sensorService.getThresholds().then(setThresholds)
    sensorService.getNotificationSettings().then(setNotifications)
  }, [user])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await sensorService.updateProfile(profile)
      setUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const saveThresholds = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await sensorService.updateThresholds(thresholds)
      setThresholds(updated)
      toast.success('Thresholds updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleNotif = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    try {
      await sensorService.updateNotificationSettings(updated)
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-navy-900">Settings</h2>

      <div className="flex gap-1 bg-white p-1 rounded-lg border border-sky-100 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-sky-600 text-white' : 'text-navy-800/60 hover:bg-sky-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <form onSubmit={saveProfile} className="card p-6 max-w-lg space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input className="input-field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'Sensor Thresholds' && thresholds && (
        <form onSubmit={saveThresholds} className="card p-6 max-w-2xl space-y-6">
          <div>
            <p className="font-medium text-navy-900 mb-2">Temperature (°C)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Minimum</label>
                <input type="number" step="0.1" className="input-field" value={thresholds.temperature.min} onChange={(e) => setThresholds({ ...thresholds, temperature: { ...thresholds.temperature, min: Number(e.target.value) } })} />
              </div>
              <div>
                <label className="label-text">Maximum</label>
                <input type="number" step="0.1" className="input-field" value={thresholds.temperature.max} onChange={(e) => setThresholds({ ...thresholds, temperature: { ...thresholds.temperature, max: Number(e.target.value) } })} />
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-navy-900 mb-2">pH</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Minimum</label>
                <input type="number" step="0.1" className="input-field" value={thresholds.ph.min} onChange={(e) => setThresholds({ ...thresholds, ph: { ...thresholds.ph, min: Number(e.target.value) } })} />
              </div>
              <div>
                <label className="label-text">Maximum</label>
                <input type="number" step="0.1" className="input-field" value={thresholds.ph.max} onChange={(e) => setThresholds({ ...thresholds, ph: { ...thresholds.ph, max: Number(e.target.value) } })} />
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-navy-900 mb-2">Dissolved Oxygen</p>
            <label className="label-text">Minimum (mg/L)</label>
            <input type="number" step="0.1" className="input-field max-w-xs" value={thresholds.dissolvedOxygen.min} onChange={(e) => setThresholds({ ...thresholds, dissolvedOxygen: { ...thresholds.dissolvedOxygen, min: Number(e.target.value) } })} />
          </div>

          <div>
            <p className="font-medium text-navy-900 mb-2">Turbidity</p>
            <label className="label-text">Maximum (NTU)</label>
            <input type="number" step="0.1" className="input-field max-w-xs" value={thresholds.turbidity.max} onChange={(e) => setThresholds({ ...thresholds, turbidity: { ...thresholds.turbidity, max: Number(e.target.value) } })} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Thresholds'}
          </button>
        </form>
      )}

      {tab === 'Notifications' && notifications && (
        <div className="card p-6 max-w-lg space-y-1">
          {[
            { key: 'lowDO', label: 'Low Dissolved Oxygen alerts' },
            { key: 'highTemperature', label: 'High Temperature alerts' },
            { key: 'ph', label: 'pH alerts' },
            { key: 'turbidity', label: 'Turbidity alerts' },
            { key: 'deviceOffline', label: 'Device Offline alerts' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-sky-50 last:border-0">
              <span className="text-sm text-navy-800">{item.label}</span>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifications[item.key] ? 'bg-sky-600' : 'bg-sky-100'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
