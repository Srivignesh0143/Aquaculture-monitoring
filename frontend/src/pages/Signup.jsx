import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Waves } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0-4
}

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-sky-500', 'bg-green-500']

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required'
    if (!agreed) errs.agreed = 'You must accept the terms and conditions'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created successfully')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-6 py-10">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <Waves size={20} />
          </div>
          <span className="font-bold text-xl text-navy-900">Aquaculture Monitor</span>
        </div>

        <h1 className="text-xl font-bold text-navy-900 text-center mb-1">Create your account</h1>
        <p className="text-navy-800/60 text-sm text-center mb-6">Sign up as a Farmer / Operator</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" value={form.fullName} onChange={update('fullName')} placeholder="Jane Cooper" />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="label-text">Email</label>
            <input className="input-field" value={form.email} onChange={update('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label-text">Phone Number</label>
            <input className="input-field" value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="+1 555 000 0000" />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-11"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-800/40">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? STRENGTH_COLORS[strength] : 'bg-sky-100'}`} />
                  ))}
                </div>
                <p className="text-xs text-navy-800/50 mt-1">{STRENGTH_LABELS[strength]}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="label-text">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <label className="flex items-start gap-2 text-sm text-navy-800/70 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
            />
            I agree to the Terms and Conditions and Privacy Policy
          </label>
          {errors.agreed && <p className="text-xs text-red-500 -mt-2">{errors.agreed}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-navy-800/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
