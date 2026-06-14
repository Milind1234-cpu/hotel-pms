import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
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
    <div className="min-h-screen flex items-center justify-center p-md" style={{
      background: 'radial-gradient(ellipse at 60% 40%, #1e6ef5 0%, #1458d6 40%, #0f3fa8 100%)'
    }}>
      <div className="w-full max-w-xl flex flex-col items-center">

        {/* Brand */}
        <div className="mb-2xl text-center flex flex-col items-center">
          <div className="mb-md w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
          </div>
          <h1 className="text-4xl text-white mb-sm custom-tracking-tight font-extrabold">Hotel PMS</h1>
          <p className="text-sm text-white/60 custom-tracking-wide uppercase font-semibold">Professional Property Management</p>
        </div>

        {/* Card */}
        <main className="glass-card w-full p-2xl md:p-[64px] rounded-[32px]">
          <header className="mb-2xl">
            <h2 className="text-[32px] leading-tight font-bold text-on-surface mb-md custom-tracking-tight">Create account</h2>
            <p className="font-body-md text-on-surface-variant/70">Register your property to get started with Hotel PMS.</p>
          </header>

          <form className="space-y-xl" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-md">
              <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="name">
                Full Name
              </label>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">person</span>
                <input
                  className="w-full pl-12 pr-md py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50"
                  id="name"
                  name="name"
                  placeholder="Milind Lanje"
                  required
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-md">
              <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">mail</span>
                <input
                  className="w-full pl-12 pr-md py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50"
                  id="email"
                  name="email"
                  placeholder="milind@hotel.com"
                  required
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-md">
              <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
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

            {/* Role */}
            <div className="space-y-md">
              <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="role">
                Role
              </label>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">badge</span>
                <select
                  className="w-full pl-12 pr-md py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface appearance-none cursor-pointer"
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <span className="material-symbols-outlined absolute right-md text-outline pointer-events-none text-xl">expand_more</span>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-md">
              <button
                className="primary-gradient-btn w-full py-5 px-lg rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-md group"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                {!loading && (
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-2xl pt-2xl border-t border-outline-variant/10 flex flex-col items-center gap-md">
            <p className="font-body-sm text-on-surface-variant/60">Already have an account?</p>
            <Link
              className="font-label-md text-sm font-bold text-primary py-3 px-xl rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all"
              to="/login"
            >
              Sign in to Dashboard
            </Link>
          </footer>
        </main>

        {/* Footer links */}
        <nav className="mt-2xl flex gap-xl text-white/40 font-label-md text-sm">
          <a className="hover:text-white transition-colors" href="#">Help Center</a>
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  )
}
