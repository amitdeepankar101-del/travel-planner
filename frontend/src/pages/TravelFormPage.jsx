/**
 * pages/TravelFormPage.jsx — Multi-field form to collect trip preferences.
 *
 * Fields: destination, dates, budget, travelers, interests, travel style,
 *         special requests.
 *
 * On submit: calls POST /trips/ which generates an itinerary AND saves it.
 * On success: redirects to the new trip's itinerary page.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const INTERESTS = [
  'Beaches', 'Mountains', 'History', 'Culture', 'Food & Cuisine',
  'Adventure Sports', 'Shopping', 'Nightlife', 'Nature & Wildlife',
  'Art & Museums', 'Architecture', 'Photography', 'Relaxation', 'Family Activities',
]

const TRAVEL_STYLES = [
  { value: 'budget', label: '🎒 Budget', desc: 'Hostels, street food, free attractions' },
  { value: 'mid-range', label: '🏨 Mid-Range', desc: '3-star hotels, local restaurants' },
  { value: 'luxury', label: '✨ Luxury', desc: '5-star hotels, fine dining, premium experiences' },
]

export default function TravelFormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'USD',
    num_travelers: 1,
    travel_style: 'mid-range',
    interests: [],
    special_requests: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const lower = interest.toLowerCase()
      const exists = prev.interests.includes(lower)
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== lower)
          : [...prev.interests, lower],
      }
    })
  }

  const validate = () => {
    if (!form.destination.trim()) return 'Please enter a destination.'
    if (!form.start_date) return 'Please select a start date.'
    if (!form.end_date) return 'Please select an end date.'
    if (form.end_date < form.start_date) return 'End date must be after start date.'
    const days = (new Date(form.end_date) - new Date(form.start_date)) / 86400000 + 1
    if (days > 30) return 'Trip duration cannot exceed 30 days.'
    if (!form.budget || parseFloat(form.budget) <= 0) return 'Please enter a valid budget.'
    if (form.interests.length === 0) return 'Please select at least one interest.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      const payload = {
        preferences: {
          destination: form.destination.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          budget: parseFloat(form.budget),
          currency: form.currency,
          num_travelers: parseInt(form.num_travelers),
          travel_style: form.travel_style,
          interests: form.interests,
          special_requests: form.special_requests.trim() || null,
        },
      }
      const res = await api.post('/trips/', payload)
      toast.success('Itinerary generated and saved!')
      navigate(`/trips/${res.data.id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        // Pydantic validation error array
        setError(detail.map((d) => d.msg).join(' • '))
      } else {
        setError(detail || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Generating your personalized itinerary…</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>This may take up to 30 seconds.</p>
        </div>
      )}

      <div className="container" style={{ maxWidth: 680 }}>
        <div className="travel-form-page">
          <h1>Plan Your Trip ✈️</h1>
          <p className="subtitle">
            Fill in your preferences and our AI will create a personalized itinerary for you.
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Destination */}
            <div className="form-group">
              <label htmlFor="destination">Destination *</label>
              <input id="destination" name="destination" type="text" className="form-control"
                placeholder="e.g. Paris, France or Tokyo, Japan"
                value={form.destination} onChange={handleChange} required />
            </div>

            {/* Dates */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input id="start_date" name="start_date" type="date" className="form-control"
                  min={today} value={form.start_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date *</label>
                <input id="end_date" name="end_date" type="date" className="form-control"
                  min={form.start_date || today} value={form.end_date} onChange={handleChange} required />
              </div>
            </div>

            {/* Budget */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="budget">Total Budget *</label>
                <input id="budget" name="budget" type="number" className="form-control"
                  placeholder="e.g. 2000" min="1" step="any"
                  value={form.budget} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select id="currency" name="currency" className="form-control"
                  value={form.currency} onChange={handleChange}>
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travelers */}
            <div className="form-group">
              <label htmlFor="num_travelers">Number of Travelers *</label>
              <input id="num_travelers" name="num_travelers" type="number" className="form-control"
                min="1" max="50" value={form.num_travelers} onChange={handleChange} required />
            </div>

            {/* Travel Style */}
            <div className="form-group">
              <label>Travel Style *</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {TRAVEL_STYLES.map((s) => (
                  <label
                    key={s.value}
                    style={{
                      flex: '1 1 160px',
                      border: `2px solid ${form.travel_style === s.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 8,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: form.travel_style === s.value ? '#eff6ff' : 'var(--bg)',
                    }}
                  >
                    <input
                      type="radio" name="travel_style" value={s.value}
                      checked={form.travel_style === s.value}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="form-group">
              <label>Interests * <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(select all that apply)</span></label>
              <div className="tag-group">
                {INTERESTS.map((interest) => (
                  <span
                    key={interest}
                    className={`tag ${form.interests.includes(interest.toLowerCase()) ? 'tag--selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleInterest(interest)}
                  >
                    {interest}
                  </span>
                ))}
              </div>
              {form.interests.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  Selected: {form.interests.join(', ')}
                </p>
              )}
            </div>

            {/* Special Requests */}
            <div className="form-group">
              <label htmlFor="special_requests">Special Requests <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <textarea id="special_requests" name="special_requests" className="form-control"
                placeholder="e.g. vegetarian meals, wheelchair accessible, avoid crowded places..."
                rows={3} value={form.special_requests} onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}
              style={{ marginTop: 8 }}>
              <Sparkles size={18} />
              {loading ? 'Generating Itinerary…' : 'Generate My Itinerary'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
              AI-generated itineraries may take up to 30 seconds. Your trip will be saved automatically.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
