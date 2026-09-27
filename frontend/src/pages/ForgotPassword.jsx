import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Waves, ArrowLeft, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Unable to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-6">
      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <Waves size={20} />
          </div>
          <span className="font-bold text-xl text-navy-900">Aquaculture Monitor</span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-xl font-bold text-navy-900 text-center mb-1">Reset your password</h1>
            <p className="text-navy-800/60 text-sm text-center mb-6">
              Enter your email and we'll send you reset instructions.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4 text-sky-600">
              <MailCheck size={26} />
            </div>
            <h2 className="font-semibold text-navy-900 mb-1">Check your email</h2>
            <p className="text-sm text-navy-800/60">We sent reset instructions to {email}</p>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-sky-600 hover:underline font-medium mt-6">
          <ArrowLeft size={15} /> Back to login
        </Link>
      </div>
    </div>
  )
}
