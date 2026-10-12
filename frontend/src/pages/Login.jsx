import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Waves, Fish } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('demo@aquaculture.io')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email, password, remember)
      toast.success('Welcome back!')
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-sky-50">
      {/* Illustration side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 to-navy-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="flex items-center gap-2.5 text-white">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <Waves size={22} />
          </div>
          <span className="font-bold text-xl">Aquaculture Monitor</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-tight mb-3">
            Real-time pond intelligence,<br />in the palm of your hand.
          </h2>
          <p className="text-sky-100/80 max-w-md">
            Monitor water temperature, pH, water level and turbidity, and control your
            aerators and feeders remotely from anywhere.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sky-100/70 text-sm relative z-10">
          <div className="flex items-center gap-2"><Fish size={16} /> Live sensor data</div>
          <div className="flex items-center gap-2"><Fish size={16} /> Automated alerts</div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-white/5" />
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Waves size={20} />
            </div>
            <span className="font-bold text-xl text-navy-900">Aquaculture Monitor</span>
          </div>

          <h1 className="text-2xl font-bold text-navy-900 mb-1">Welcome back</h1>
          <p className="text-navy-800/60 text-sm mb-7">Sign in to view your pond dashboard.</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-800/40"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-navy-800/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-sky-300 text-sky-600 focus:ring-sky-400"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-sky-600 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-navy-800/60 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sky-600 font-medium hover:underline">
              Create Account
            </Link>
          </p>

          <p className="text-center text-xs text-navy-800/30 mt-8">
            Demo mode — any email/password works.
          </p>
        </div>
      </div>
    </div>
  )
}
