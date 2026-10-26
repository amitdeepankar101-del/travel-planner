/**
 * pages/ItineraryPage.jsx — Full itinerary view with all actions.
 *
 * Features:
 *  - View day-by-day itinerary
 *  - Budget breakdown
 *  - Edit title/notes
 *  - Regenerate itinerary (with optional feedback)
 *  - Export as PDF
 *  - Delete trip
 *  - General tips and disclaimer
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import {
  ArrowLeft, Download, RefreshCw, Trash2, Edit3, Save, X,
  MapPin, Calendar, Users, DollarSign, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

// ── Sub-components ────────────────────────────────────────────────────────────

function BudgetCard({ label, value, currency }) {
  return (
    <div className="budget-card">
      <div className="budget-card__label">{label}</div>
      <div className="budget-card__value">{Number(value).toFixed(0)} {currency}</div>
    </div>
  )
}

function ActivityItem({ activity, currency }) {
  return (
    <div className="activity">
      <div className="activity__time">{activity.time}</div>
      <div className="activity__content">
        <h4>{activity.name}</h4>
        <p>{activity.description}</p>
        <div className="activity__cost">
          ~{Number(activity.estimated_cost || 0).toFixed(0)} {currency} / person
        </div>
        {activity.tips && (
          <div className="activity__tip">💡 {activity.tips}</div>
        )}
      </div>
    </div>
  )
}

function DayCard({ day, currency }) {
  return (
    <div className="day-card">
      <div className="day-card__header">
        <h3>Day {day.day}: {day.title}</h3>
        <span>{day.date}</span>
      </div>
      <div className="day-card__body">
        {day.activities?.map((act, i) => (
          <ActivityItem key={i} activity={act} currency={currency} />
        ))}

        {(day.accommodation_note || day.meals_note || day.transport_note) && (
          <div className="day-notes">
            {day.accommodation_note && (
              <div className="day-note">
                <div className="day-note__label">🏨 Accommodation</div>
                <div className="day-note__text">{day.accommodation_note}</div>
              </div>
            )}
            {day.meals_note && (
              <div className="day-note">
                <div className="day-note__label">🍽️ Meals</div>
                <div className="day-note__text">{day.meals_note}</div>
              </div>
            )}
            {day.transport_note && (
              <div className="day-note">
                <div className="day-note__label">🚌 Transport</div>
                <div className="day-note__text">{day.transport_note}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
          Day total: ~{Number(day.day_total_cost || 0).toFixed(0)} {currency} / person
        </div>
      </div>
    </div>
  )
}

function RegenerateModal({ trip, onRegenerate, onClose, loading }) {
  const [feedback, setFeedback] = useState('')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Regenerate Itinerary</h3>
        <p>
          Generate a new itinerary for this trip. You can optionally tell the AI
          what you&apos;d like to change.
        </p>
        <div className="form-group">
          <label htmlFor="regen-feedback">Feedback (optional)</label>
          <textarea id="regen-feedback" className="form-control"
            rows={3} style={{ resize: 'vertical' }}
            placeholder="e.g. More outdoor activities, less museums, include a cooking class…"
            value={feedback} onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn--primary" onClick={() => onRegenerate(feedback)} disabled={loading}>
            <RefreshCw size={14} />
            {loading ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ onConfirm, onClose, loading }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete this trip?</h3>
        <p>This will permanently remove the trip and its itinerary. This cannot be undone.</p>
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Trip'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ItineraryPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal state
  const [showRegen, setShowRegen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const fetchTrip = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/trips/${id}`)
      setTrip(res.data)
      setEditTitle(res.data.title)
      setEditNotes(res.data.notes || '')
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Trip not found. It may have been deleted.')
      } else {
        setError('Could not load trip. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrip() }, [id])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/trips/${id}`, { title: editTitle, notes: editNotes || null })
      setTrip(res.data)
      setEditing(false)
      toast.success('Trip updated.')
    } catch {
      toast.error('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async (feedback) => {
    setRegenLoading(true)
    try {
      const res = await api.post(`/trips/${id}/regenerate`, {
        preferences: {
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          budget: trip.budget,
          currency: trip.currency,
          num_travelers: trip.num_travelers,
          travel_style: trip.travel_style,
          interests: trip.interests,
          special_requests: trip.special_requests,
        },
        feedback: feedback || null,
      })
      setTrip(res.data)
      setShowRegen(false)
      toast.success('Itinerary regenerated!')
    } catch {
      toast.error('Could not regenerate itinerary.')
    } finally {
      setRegenLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/trips/${id}`)
      toast.success('Trip deleted.')
      navigate('/dashboard')
    } catch {
      toast.error('Could not delete trip.')
      setDeleteLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setPdfLoading(true)
    try {
      const res = await api.get(`/trips/${id}/export/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${trip.title || 'itinerary'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Could not export PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--muted)' }}>Loading itinerary…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div className="error-box" style={{ display: 'inline-block', textAlign: 'left' }}>{error}</div>
        <br />
        <Link to="/dashboard" className="btn btn--outline" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    )
  }

  const itinerary = trip?.itinerary || {}
  const currency = trip?.currency || 'USD'
  const budgetSummary = itinerary.budget_summary || {}
  const totalBudget = Object.values(budgetSummary).reduce((sum, v) => sum + Number(v || 0), 0)
  const isDemo = itinerary.summary?.includes('[DEMO') || itinerary.disclaimer?.includes('DEMO')

  const formatDate = (d) => { try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d } }

  return (
    <div className="page-wrapper">
      {(regenLoading) && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Regenerating your itinerary…</p>
        </div>
      )}

      <div className="container container--wide">
        <div className="itinerary-page">
          {/* Back + Demo badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Link to="/dashboard" className="btn btn--ghost btn--sm">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            {isDemo && <span className="badge badge--demo">DEMO MODE — Add Grok API key for real AI</span>}
          </div>

          {/* Header */}
          <div className="itinerary-header">
            {editing ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <input
                  className="form-control"
                  style={{ flex: '1 1 300px', fontSize: 18, fontWeight: 700 }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button className="btn btn--primary btn--sm" onClick={handleSaveEdit} disabled={saving}>
                  <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>
                  <X size={13} /> Cancel
                </button>
              </div>
            ) : (
              <h1>{trip.title}</h1>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 8, fontSize: 14, color: 'var(--muted)' }}>
              <span><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{trip.destination}</span>
              <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span>
              <span><Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{trip.num_travelers} traveler{trip.num_travelers !== 1 ? 's' : ''}</span>
              <span><DollarSign size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{trip.budget} {currency} total · {trip.travel_style}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="itinerary-actions">
            <button className="btn btn--outline btn--sm" onClick={() => setEditing(!editing)}>
              <Edit3 size={13} /> Edit
            </button>
            <button className="btn btn--outline btn--sm" onClick={() => setShowRegen(true)}>
              <RefreshCw size={13} /> Regenerate
            </button>
            <button className="btn btn--outline btn--sm" onClick={handleExportPDF} disabled={pdfLoading}>
              <Download size={13} /> {pdfLoading ? 'Exporting…' : 'Export PDF'}
            </button>
            <button
              className="btn btn--outline btn--sm"
              style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
              onClick={() => setShowDelete(true)}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>

          {/* Notes */}
          {editing && (
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Personal Notes</label>
              <textarea className="form-control" rows={3} style={{ resize: 'vertical' }}
                placeholder="Add your own notes about this trip…"
                value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          )}
          {!editing && trip.notes && (
            <div className="card card--surface" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>YOUR NOTES</div>
              <p style={{ fontSize: 14 }}>{trip.notes}</p>
            </div>
          )}

          {/* Summary */}
          {itinerary.summary && (
            <div className="card" style={{ marginBottom: 28 }}>
              <div className="section-title">Trip Summary</div>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>{itinerary.summary}</p>
            </div>
          )}

          {/* Budget Breakdown */}
          {Object.keys(budgetSummary).length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div className="section-title"><DollarSign size={16} /> Budget Breakdown</div>
              <div className="budget-grid">
                {Object.entries(budgetSummary).map(([key, val]) => (
                  <BudgetCard key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} currency={currency} />
                ))}
                <BudgetCard label="TOTAL" value={totalBudget} currency={currency} />
              </div>
            </div>
          )}

          {/* Day Plans */}
          {itinerary.days?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div className="section-title">📅 Day-by-Day Itinerary</div>
              {itinerary.days.map((day) => (
                <DayCard key={day.day} day={day} currency={currency} />
              ))}
            </div>
          )}

          {/* General Tips */}
          {itinerary.general_tips?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title"><CheckCircle size={16} color="var(--success)" /> General Travel Tips</div>
              <ul className="tips-list">
                {itinerary.general_tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          {itinerary.disclaimer && (
            <div className="disclaimer">⚠️ {itinerary.disclaimer}</div>
          )}
        </div>
      </div>

      {showRegen && (
        <RegenerateModal
          trip={trip}
          onRegenerate={handleRegenerate}
          onClose={() => setShowRegen(false)}
          loading={regenLoading}
        />
      )}
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
