/**
 * context/AuthContext.jsx — Global authentication state.
 *
 * This React Context stores the logged-in user and token.
 * Any component that needs to know "who is logged in" can call useAuth().
 *
 * On app load, we restore auth state from localStorage so the user
 * stays logged in after a page refresh.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)  // true while restoring from localStorage

  // Restore session on first load
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user_id, email: userEmail, full_name } = res.data
    const userData = { user_id, email: userEmail, full_name }
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }

  const register = async (email, password, full_name) => {
    await api.post('/auth/register', { email, password, full_name })
    // Registration doesn't log in automatically (Supabase may require email confirmation)
    // Return success so the page can show a message
    return true
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isLoggedIn = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this instead of useContext(AuthContext) directly
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
