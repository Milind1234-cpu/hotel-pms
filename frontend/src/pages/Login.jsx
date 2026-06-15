import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.access_token, res.data.user)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 px-4"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #1e6ef5 0%, #1458d6 40%, #0f3fa8 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Brand */}
        <div className="mb-5 text-center flex flex-col items-center">
          <div className="mb-2 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              apartment
            </span>
          </div>
          <h1 className="text-2xl text-white font-extrabold tracking-tight">Hotel PMS</h1>
          <p className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mt-0.5">
            Professional Property Management
          </p>
        </div>

        {/* Card */}
        <main className="glass-card w-full px-8 py-7 rounded-3xl">
          <header className="mb-5">
            <h2 className="text-[24px] font-bold text-on-surface tracking-tight leading-tight">Welcome back</h2>
            <p className="text-[13px] text-on-surface-variant/70 mt-1">
              Securely sign in to your dashboard to manage your properties and reservations.
            </p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center group input-glow rounded-xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input
                  className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                  id="email"
                  name="email"
                  placeholder="milind@hotel.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <a className="text-[12px] font-semibold text-primary hover:text-secondary transition-colors" href="/forgot-password">
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center group input-glow rounded-xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                className="w-4 h-4 rounded border-outline-variant/40 text-primary focus:ring-primary/20 cursor-pointer"
                id="remember"
                type="checkbox"
              />
              <label htmlFor="remember" className="text-[13px] text-on-surface-variant cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {/* Submit */}
            <button
              className="primary-gradient-btn w-full py-3.5 px-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 group mt-1"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : 'Sign In to Dashboard'}</span>
              {!loading && (
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-outline-variant/10 flex flex-col items-center gap-2">
            <p className="text-[12px] text-on-surface-variant/60">New to Hotel PMS?</p>
            <Link
              className="text-[13px] font-bold text-primary py-2 px-6 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all"
              to="/register"
            >
              Register your Property
            </Link>
          </div>
        </main>

        {/* Footer links */}
        <nav className="mt-4 flex gap-6 text-white/40 text-[12px]">
          <a className="hover:text-white transition-colors" href="#">Help Center</a>
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  )
}
