import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [devUrl, setDevUrl] = useState(null) // shown when email not configured

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSubmitted(true)
      // If email service not configured, backend returns reset_url for dev use
      if (res.data.reset_url) {
        setDevUrl(res.data.reset_url)
      }
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
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
          <p className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mt-0.5">Professional Property Management</p>
        </div>

        {/* Card */}
        <main className="glass-card w-full px-8 py-7 rounded-3xl">
          {!submitted ? (
            <>
              <header className="mb-5">
                <h2 className="text-[24px] font-bold text-on-surface tracking-tight">
                  Forgot password?
                </h2>
                <p className="text-[13px] text-on-surface-variant/70 mt-1">
                  Enter your registered email and we'll send you a reset link.
                </p>
              </header>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    className="text-[11px] font-bold text-on-surface-variant/80 block uppercase tracking-widest"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center group input-glow rounded-xl transition-all border border-outline-variant/30 bg-white">
                    <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors text-[20px]">
                      mail
                    </span>
                    <input
                      className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant/50"
                      id="email" type="email" placeholder="milind@hotel.com"
                      required value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="primary-gradient-btn w-full py-3.5 px-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 group mt-1"
                  type="submit" disabled={loading}
                >
                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    {!loading && (
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">send</span>
                    )}
                  </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-600 text-[36px]">mark_email_read</span>
              </div>
              <div>
                <h2 className="text-[24px] font-bold text-on-surface mb-2">Check your inbox</h2>
                <p className="text-on-surface-variant/70 font-body-md">
                  If <strong>{email}</strong> is registered, a reset link has been sent.
                </p>
                <p className="text-on-surface-variant/50 text-sm mt-2">
                  The link expires in 30 minutes.
                </p>
              </div>

              {/* Dev mode — show direct link if email not configured */}
              {devUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <p className="text-amber-800 font-bold text-sm mb-2">
                    ⚠️ Email not configured — use this link directly:
                  </p>
                  <a
                    href={devUrl}
                    className="text-primary text-sm font-medium break-all underline"
                  >
                    {devUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          <footer className="mt-5 pt-4 border-t border-outline-variant/10 flex justify-center">
            <Link
              className="font-label-md text-sm font-bold text-primary py-3 px-xl rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all"
              to="/login"
            >
              ← Back to Login
            </Link>
          </footer>
        </main>
      </div>
    </div>
  )
}
