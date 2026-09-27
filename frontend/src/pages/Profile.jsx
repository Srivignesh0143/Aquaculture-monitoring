import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { sensorService } from '../services/sensorService.js'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwords.next.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      await sensorService.updateProfile({}) // mock: password change no-op
      toast.success('Password changed successfully')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Unable to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div>
          <h2 className="font-semibold text-navy-900 text-lg">{user?.name}</h2>
          <p className="text-sm text-navy-800/60">{user?.role}</p>
          <p className="text-sm text-navy-800/50">{user?.email}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label-text">Current Password</label>
            <input type="password" className="input-field" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </div>
          <div>
            <label className="label-text">New Password</label>
            <input type="password" className="input-field" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Confirm New Password</label>
            <input type="password" className="input-field" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
