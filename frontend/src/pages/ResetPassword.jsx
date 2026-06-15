import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [tokenError, setTokenError] = useState(false)
  const navigate = useNavigate()

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenError(true)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Reset failed'
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setTokenError(true)
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-md"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #1e6ef5 0%, #1458d6 40%, #0f3fa8 100%)' }}
    >
      <div className="w-full max-w-xl flex flex-col items-center">

        {/* Brand */}
        <div className="mb-2xl text-center flex flex-col items-center">
          <div className="mb-md w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              apartment
            </span>
          </div>
          <h1 className="text-4xl text-white mb-sm custom-tracking-tight font-extrabold">Hotel PMS</h1>
          <p className="text-sm text-white/60 custom-tracking-wide uppercase font-semibold">Professional Property Management</p>
        </div>

        <main className="glass-card w-full p-2xl md:p-[64px] rounded-[32px]">

          {/* Token error state */}
          {tokenError ? (
            <div className="text-center space-y-xl">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-red-500 text-[36px]">link_off</span>
              </div>
              <div>
                <h2 className="text-[24px] font-bold text-on-surface mb-2">Link expired or invalid</h2>
                <p className="text-on-surface-variant/70">
                  This password reset link has expired or is invalid. Reset links are valid for 30 minutes.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-block primary-gradient-btn py-3 px-xl rounded-2xl text-white font-bold"
              >
                Request a new link
              </Link>
            </div>
          ) : done ? (
            /* Success state */
            <div className="text-center space-y-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-600 text-[36px]">check_circle</span>
              </div>
              <div>
                <h2 className="text-[24px] font-bold text-on-surface mb-2">Password updated!</h2>
                <p className="text-on-surface-variant/70">Redirecting you to login...</p>
              </div>
            </div>
          ) : (
            /* Reset form */
            <>
              <header className="mb-2xl">
                <h2 className="text-[28px] leading-tight font-bold text-on-surface mb-md custom-tracking-tight">
                  Set new password
                </h2>
                <p className="font-body-md text-on-surface-variant/70">
                  Choose a strong password with at least 8 characters.
                </p>
              </header>

              <form className="space-y-xl" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="space-y-md">
                  <label
                    className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide"
                    htmlFor="password"
                  >
                    New Password
                  </label>
                  <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                    <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">
                      lock
                    </span>
                    <input
                      className="w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-md text-outline hover:text-on-surface transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-md">
                  <label
                    className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide"
                    htmlFor="confirm"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                    <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">
                      lock_reset
                    </span>
                    <input
                      className="w-full pl-12 pr-md py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50"
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-red-500 text-sm font-medium">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-md">
                  <button
                    className="primary-gradient-btn w-full py-5 px-lg rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-md group disabled:opacity-60"
                    type="submit"
                    disabled={loading || (confirm.length > 0 && password !== confirm)}
                  >
                    <span>{loading ? 'Updating...' : 'Reset Password'}</span>
                    {!loading && (
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {!done && !tokenError && (
            <footer className="mt-2xl pt-2xl border-t border-outline-variant/10 flex justify-center">
              <Link
                className="font-label-md text-sm font-bold text-primary py-3 px-xl rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all"
                to="/login"
              >
                ← Back to Login
              </Link>
            </footer>
          )}
        </main>
      </div>
    </div>
  )
}
