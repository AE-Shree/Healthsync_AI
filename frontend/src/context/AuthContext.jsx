import { createContext, useCallback, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Token helpers (localStorage) ──────────────────────────────────────
// In a higher-security setup, swap localStorage for an httpOnly cookie
// managed by a thin BFF (Backend-For-Frontend) layer.
const TOKEN_KEY = 'hs_token'
const USER_KEY  = 'hs_user'

function readToken()  { return localStorage.getItem(TOKEN_KEY) }
function readUser()   {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}
function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Provider ──────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user,  setUser]  = useState(readUser)

  // ── Register ────────────────────────────────────────────────────────
  const register = useCallback(async (email, password, fullName) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, full_name: fullName || null }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Registration failed. Please try again.')
    }
    // Auto-login after successful registration
    return login(email, password)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ───────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // FastAPI OAuth2 endpoint expects form-encoded body
    const form = new URLSearchParams()
    form.append('username', email)   // OAuth2 spec uses "username"
    form.append('password', password)

    const res = await fetch(`${API_BASE}/api/v1/auth/login/access-token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    form.toString(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Login failed. Check your email and password.')
    }

    const { access_token } = await res.json()

    // Fetch full profile with the new token
    const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const userData = meRes.ok ? await meRes.json() : { email }

    storeSession(access_token, userData)
    setToken(access_token)
    setUser(userData)
    return userData
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  // ── Authenticated fetch helper (injects Bearer token) ────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
    if (res.status === 401) {
      // Token expired — force logout so UI redirects to login
      logout()
      throw new Error('Session expired. Please log in again.')
    }
    return res
  }, [token, logout])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      authFetch,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be called inside <AuthProvider>')
  return ctx
}
