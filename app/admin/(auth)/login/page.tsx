'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
  const { login, session } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/admin/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) router.replace(from)
  }, [session, router, from])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Username wajib diisi'); return }
    if (!password) { setError('Password wajib diisi'); return }

    setLoading(true)
    const result = await login(username.trim(), password)
    setLoading(false)

    if (result.ok) {
      router.replace(from)
    } else {
      setError(result.error ?? 'Login gagal')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px',
    color: '#f0f4ff',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(165,180,252,0.7)' }}
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Masukkan username"
          style={inputStyle}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(165,180,252,0.4)'
            e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.10)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(165,180,252,0.7)' }}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Masukkan password"
            style={{ ...inputStyle, paddingRight: '48px' }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(165,180,252,0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.10)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
            style={{ color: 'rgba(165,180,252,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(165,180,252,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(165,180,252,0.5)' }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all mt-2"
        style={{ background: '#4f46e5', color: '#ffffff' }}
        onMouseEnter={e => {
          if (!loading) {
            e.currentTarget.style.background = '#4338ca'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.40)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = loading ? '#4f46e5' : '#4f46e5'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.opacity = loading ? '0.6' : '1'
        }}
      >
        {loading ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
            />
            Memproses...
          </>
        ) : (
          <>
            Masuk ke Portal
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-jakarta"
      style={{ background: '#080c14' }}
    >
      {/* Subtle background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative">

        {/* Logo block */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: 'rgba(232,48,58,0.12)',
                border: '1px solid rgba(232,48,58,0.25)',
              }}
            >
              🇯🇵
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#f0f4ff' }}>
                JapanArena
              </h1>
              <p
                className="text-[11px] font-bold tracking-widest uppercase mt-0.5"
                style={{ color: '#e8303a' }}
              >
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.40)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-base font-bold" style={{ color: '#f0f4ff' }}>
              Masuk ke Portal
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(120,140,180,0.7)' }}>
              Masukkan kredensial admin kamu untuk lanjut
            </p>
          </div>

          <Suspense
            fallback={
              <div className="h-48 flex items-center justify-center">
                <span
                  className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(79,70,229,0.25)', borderTopColor: '#4f46e5' }}
                />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <p className="text-[10px] font-semibold" style={{ color: 'rgba(120,140,180,0.35)' }}>
            JapanArena Jastip · v1.0.0
          </p>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </div>
  )
}
