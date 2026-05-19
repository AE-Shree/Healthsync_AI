import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Tiny inline helpers ───────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  color: 'white',
  fontSize: '15px',
  padding: '16px 18px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '10px',
}

export default function GetStarted() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Where to go after a successful auth (ProtectedRoute stores this)
  const from = location.state?.from || '/onboarding'

  // ── Form state ────────────────────────────────────────────────────
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)

  // ── UI state ──────────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')

    // Basic client-side validation
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!password) { setError('Please enter a password.'); return }
    if (mode === 'register') {
      if (password.length < 8)              { setError('Password must be at least 8 characters.'); return }
      if (!/[A-Z]/.test(password))          { setError('Password must contain at least one uppercase letter.'); return }
      if (!/\d/.test(password))             { setError('Password must contain at least one number.'); return }
      if (!fullName.trim())                 { setError('Please enter your full name.'); return }
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email.trim(), password, fullName.trim())
      } else {
        await login(email.trim(), password)
      }
      // Navigate to wherever the user was trying to go (or onboarding for new users)
      navigate(mode === 'register' ? '/onboarding' : from, { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Allow Enter key to submit
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1b3e 0%, #0a2a5c 50%, #0d1b3e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0,196,180,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', background: 'rgba(255,255,255,0.04)'
          }}>
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <path d="M24 42s-18-11.2-18-23C6 12.3 10.3 8 15.6 8c3 0 5.8 1.5 7.6 3.9L24 13l.8-1.1C26.6 9.5 29.4 8 32.4 8 37.7 8 42 12.3 42 19c0 11.8-18 23-18 23z"
                stroke="white" strokeWidth="2" fill="none" />
              <path d="M22 22h4M24 20v4" stroke="#00c4b4" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 26c0 2.2-1.8 4-4 4s-4-1.8-4-4" stroke="#00c4b4" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', letterSpacing: '2px' }}>
            HEALTHSYNC<span style={{ color: '#00c4b4' }}>.AI</span>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '2.5px', marginTop: '4px' }}>
            SMARTER CARE WITH AI
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '26px', fontWeight: '800', color: 'white',
            lineHeight: '1.25', marginBottom: '10px',
            fontFamily: "'DM Serif Display', serif"
          }}>
            {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
          </h1>
          <p style={{ fontSize: '14px', color: '#00c4b4', fontWeight: '500' }}>
            AI-powered health reporting
          </p>
        </div>

        {/* Login / Register toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.07)', borderRadius: '14px',
          padding: '4px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                padding: '12px', borderRadius: '10px', border: 'none',
                background: mode === m
                  ? 'linear-gradient(135deg, #1e88e5, #00b8d4)'
                  : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.55)',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: mode === m ? '0 4px 14px rgba(30,136,229,0.25)' : 'none'
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Fields */}
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            className="auth-input"
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={inputStyle}
          className="auth-input"
        />

        {/* Password with show/hide toggle */}
        <div style={{
          position: 'relative', marginBottom: '10px'
        }}>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder={mode === 'register' ? 'Password (min 8 chars, 1 uppercase, 1 number)' : 'Password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '50px' }}
            className="auth-input"
          />
          <button
            onClick={() => setShowPass(p => !p)}
            type="button"
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif"
            }}
          >
            {showPass ? 'hide' : 'show'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', padding: '12px 16px',
            color: '#fca5a5', fontSize: '13px', fontWeight: '500',
            marginBottom: '14px', lineHeight: '1.5'
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '17px', border: 'none', borderRadius: '14px',
            background: loading
              ? 'rgba(255,255,255,0.15)'
              : 'linear-gradient(90deg, #1e88e5 0%, #00b8d4 50%, #00c896 100%)',
            color: 'white', fontSize: '16px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(30,136,229,0.35)',
            transition: 'all 0.3s',
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.3px'
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block'
              }} />
              {mode === 'register' ? 'Creating account…' : 'Signing in…'}
            </>
          ) : (
            <>
              {mode === 'register' ? 'Create Account' : 'Sign In'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Feature badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '📊', label: 'AI Report\nScreening' },
            { icon: '📈', label: 'Health Trend\nTracking' },
            { icon: '🔒', label: 'Secure &\nPrivate' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.6' }}>
          Securely manage your health reports with AI-powered insights
        </p>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            className="back-link">
            ← Back to home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input:focus {
          border-color: rgba(0,196,180,0.5) !important;
          box-shadow: 0 0 0 3px rgba(0,196,180,0.08);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.3); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0d1b3e inset;
          -webkit-text-fill-color: white;
        }
        .back-link:hover { color: rgba(255,255,255,0.6) !important; }
      `}</style>
    </div>
  )
}
