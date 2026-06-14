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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-md" style={{
      background: 'radial-gradient(ellipse at 60% 40%, #1e6ef5 0%, #1458d6 40%, #0f3fa8 100%)'
    }}>

      {/* Main Content Container */}
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Brand Identity Section */}
        <div className="mb-2xl text-center flex flex-col items-center">
          <div className="mb-md w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-[36px]" style={{fontVariationSettings:"'FILL' 1"}}>apartment</span>
          </div>
          <h1 className="text-4xl text-white mb-sm custom-tracking-tight font-extrabold">Hotel PMS</h1>
          <p className="text-sm text-white/60 custom-tracking-wide uppercase font-semibold">Professional Property Management</p>
        </div>

        {/* Login Card */}
        <main className="glass-card w-full p-2xl md:p-[72px] rounded-[32px] transition-all duration-500 ease-out">
          <header className="mb-2xl">
            <h2 className="text-[32px] leading-tight font-bold text-on-surface mb-md custom-tracking-tight">Welcome back</h2>
            <p className="font-body-md text-on-surface-variant/70">Securely sign in to your dashboard to manage your properties and reservations.</p>
          </header>

          <form className="space-y-xl" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-md">
              <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="email">Email Address</label>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">mail</span>
                <input 
                  className="w-full pl-12 pr-md py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50" 
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

            {/* Password Field */}
            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-xs font-bold text-on-surface-variant/80 block uppercase custom-tracking-wide" htmlFor="password">Password</label>
                <a className="font-label-md text-sm font-semibold text-primary hover:text-secondary transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative flex items-center group input-glow rounded-2xl transition-all border border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined absolute left-md text-outline group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant/50" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-md text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Additional Options Row */}
            <div className="flex items-center justify-between pt-base">
              <label className="flex items-center space-x-3 cursor-pointer group select-none">
                <div className="relative flex items-center">
                  <input 
                    className="w-6 h-6 rounded-lg border-outline-variant/40 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                    id="remember" 
                    type="checkbox" 
                  />
                </div>
                <span className="font-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-md">
              <button 
                className="primary-gradient-btn w-full py-5 px-lg rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-md group" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Processing...' : 'Sign In to Dashboard'}</span>
                {!loading && (
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-2xl pt-2xl border-t border-outline-variant/10 flex flex-col items-center gap-md">
            <p className="font-body-sm text-on-surface-variant/60">New to Hotel PMS?</p>
            <Link 
              className="font-label-md text-sm font-bold text-primary py-3 px-xl rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all" 
              to="/register"
            >
              Register your Property
            </Link>
          </footer>
        </main>

        {/* Footer Help Links */}
        <nav className="mt-2xl flex gap-xl text-white/40 font-label-md text-sm">
          <a className="hover:text-white transition-colors" href="#">Help Center</a>
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  )
}