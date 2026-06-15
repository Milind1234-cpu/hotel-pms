import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...form, role: 'staff' })
      login(res.data.access_token, res.data.user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
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
            <h2 className="text-[24px] font-bold text-on-surface tracking-tight">Create account</h2>
            <p className="text-[13px] text-on-surface-variant/70 mt-1">
              Register your property to get started with Hotel PMS.
            </p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest" htmlFor="name">
                Full Name
              </label>
              <div className="relative flex items-center group input-glow rounded-xl border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">person</span>
                <input
                  className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                  id="name" name="name" placeholder="Milind Lanje"
                  required type="text" value={form.name} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center group input-glow rounded-xl border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input
                  className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                  id="email" name="email" placeholder="milind@hotel.com"
                  required type="email" value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center group input-glow rounded-xl border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                  id="password" name="password" placeholder="Min. 8 characters"
                  required minLength={8} type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                />
                <button
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                  type="button" onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              className="primary-gradient-btn w-full py-3.5 px-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 group mt-1"
              type="submit" disabled={loading}
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && (
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-outline-variant/10 flex flex-col items-center gap-2">
            <p className="text-[12px] text-on-surface-variant/60">Already have an account?</p>
            <Link
              className="text-[13px] font-bold text-primary py-2 px-6 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all"
              to="/login"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </main>

        <nav className="mt-4 flex gap-6 text-white/40 text-[12px]">
          <a className="hover:text-white transition-colors" href="#">Help Center</a>
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  )
}
