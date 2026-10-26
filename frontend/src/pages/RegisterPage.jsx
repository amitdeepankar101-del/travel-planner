/**
 * pages/RegisterPage.jsx — New user registration form.
 *
 * After successful registration, shows a success message and
 * prompts the user to check their email (Supabase confirmation).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plane } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.full_name.trim()) return 'Please enter your full name.'
    if (!form.email) return 'Please enter your email.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      await register(form.email, form.password, form.full_name)
      setSuccess(true)
      toast.success('Account created!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h1 style={{ marginBottom: 12 }}>Check your email</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click the link in the email to activate your account, then sign in.
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            <strong>Note:</strong> If email confirmation is disabled in your Supabase project,
            you can <Link to="/login">sign in immediately</Link>.
          </p>
          <Link to="/login" className="btn btn--primary btn--full">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--accent)' }}>
          <Plane size={24} />
          <span style={{ fontWeight: 700, fontSize: 17 }}>AI Travel Planner</span>
        </div>
        <h1>Create your account</h1>
        <p className="subtitle">Free forever. No credit card required.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" name="full_name" type="text" className="form-control"
              placeholder="Jane Smith" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email} onChange={handleChange}
              autoComplete="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-control"
              placeholder="Min. 8 characters" value={form.password} onChange={handleChange}
              autoComplete="new-password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" className="form-control"
              placeholder="Repeat password" value={form.confirm} onChange={handleChange}
              autoComplete="new-password" required />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
