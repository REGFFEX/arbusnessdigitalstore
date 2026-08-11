import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

import { ARDES_CONFIG } from '../../config/ardes_config'

export default function AdminLogin() {
  const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirection automatique si déjà Admin
  useEffect(() => {
    if (!loading && isAdmin) {
      const from = (location.state as any)?.from?.pathname || `/${ADMIN_BASE}`
      navigate(from, { replace: true })
    }
  }, [isAdmin, loading, navigate, location, ADMIN_BASE])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      // La redirection sera gérée par le useEffect ci-dessus
    } catch (err: any) {
      let msg = err.message || 'Login failed'
      if (msg.toLowerCase().includes('email not confirmed')) {
        msg = 'Veuillez confirmer votre email avant de vous connecter.'
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Identifiants invalides ou compte non confirmé.'
      }
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-gold mb-2 text-center">AR Business Store</h1>
        <p className="text-gray-400 text-center mb-8 font-medium">Administration Panel</p>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-sm text-gray-500 ml-1">Email</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@example.com"
              className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-gold transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500 ml-1">Password</label>
            <div className="relative">
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-gold transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            disabled={submitting || (loading && !isAdmin)}
            className={`w-full bg-gold text-black py-4 rounded-xl mt-4 font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Connexion...
              </>
            ) : 'Se connecter'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center animate-shake flex items-center justify-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-xs">
              Accès réservé. Les nouveaux administrateurs doivent être validés par Ahraf.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
