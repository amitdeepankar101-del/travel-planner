/**
 * pages/DashboardPage.jsx — User's saved trips dashboard.
 *
 * Shows all saved trips as cards.
 * Each card links to the full itinerary view.
 * Options to delete a trip directly from the card.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { PlusCircle, MapPin, Calendar, Users, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function ConfirmDeleteModal({ trip, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Trip?</h3>
        <p>
          Are you sure you want to permanently delete &ldquo;{trip.title}&rdquo;?
          This action cannot be undone.
        </p>
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Trip'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTrips = async () => {
    setLoadingTrips(true)
    setError('')
    try {
      const res = await api.get('/trips/')
      setTrips(res.data)
    } catch (err) {
      setError('Could not load trips. Please try again.')
    } finally {
      setLoadingTrips(false)
    }
  }

  useEffect(() => { fetchTrips() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/trips/${deleteTarget.id}`)
      setTrips((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Trip deleted.')
      setDeleteTarget(null)
    } catch (err) {
      toast.error('Could not delete trip.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    try { return format(parseISO(dateStr), 'MMM d, yyyy') } catch { return dateStr }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dashboard">
          <div className="dashboard__header">
            <div>
              <h2>My Trips</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
            <Link to="/plan" className="btn btn--primary">
              <PlusCircle size={16} />
              Plan New Trip
            </Link>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loadingTrips ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div className="spinner" />
              <p style={{ marginTop: 16, color: 'var(--muted)' }}>Loading your trips…</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 52, marginBottom: 12 }}>🗺️</div>
              <h3>No trips yet</h3>
              <p>Create your first AI-powered itinerary to get started.</p>
              <Link to="/plan" className="btn btn--primary btn--lg">
                <PlusCircle size={16} />
                Plan Your First Trip
              </Link>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => (
                <div key={trip.id} className="trip-card">
                  <div className="trip-card__title">{trip.title}</div>
                  <div className="trip-card__meta">
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {trip.destination}
                  </div>
                  <div className="trip-card__meta">
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                  </div>
                  <div className="trip-card__meta">
                    <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {trip.num_travelers} traveler{trip.num_travelers !== 1 ? 's' : ''} · {trip.travel_style}
                  </div>
                  <div className="trip-card__tags">
                    {trip.interests.slice(0, 4).map((tag) => (
                      <span key={tag} className="trip-card__tag">{tag}</span>
                    ))}
                  </div>
                  <div className="trip-card__actions">
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    >
                      <Eye size={13} />
                      View
                    </button>
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                      onClick={() => setDeleteTarget(trip)}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          trip={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
