/**
 * pages/LandingPage.jsx — Public home page.
 *
 * Shown to users who are not logged in.
 * Features: hero section, feature highlights, call-to-action.
 */

import { Link } from 'react-router-dom'
import { MapPin, Sparkles, Calendar, DollarSign, FileText, Shield } from 'lucide-react'

const FEATURES = [
  {
    icon: <Sparkles size={26} color="var(--accent)" />,
    title: 'AI-Powered Itineraries',
    desc: 'Grok AI crafts personalized day-by-day plans based on your interests, budget, and travel style.',
  },
  {
    icon: <Calendar size={26} color="var(--accent)" />,
    title: 'Day-by-Day Planning',
    desc: 'Get detailed schedules with activity timings, estimated costs, and practical tips for each day.',
  },
  {
    icon: <DollarSign size={26} color="var(--accent)" />,
    title: 'Budget Tracking',
    desc: 'See a clear breakdown of estimated costs across accommodation, transport, food, and activities.',
  },
  {
    icon: <FileText size={26} color="var(--accent)" />,
    title: 'PDF Export',
    desc: 'Download your itinerary as a beautifully formatted PDF to take offline.',
  },
  {
    icon: <MapPin size={26} color="var(--accent)" />,
    title: 'Saved Trips',
    desc: 'All your itineraries are saved securely. View, edit, regenerate, or delete them anytime.',
  },
  {
    icon: <Shield size={26} color="var(--accent)" />,
    title: 'Secure & Private',
    desc: 'Your trips are private to you, protected by Supabase Row Level Security.',
  },
]

export default function LandingPage() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <h1>Plan Your Dream Trip<br />with AI</h1>
        <p>
          Tell us where you want to go, your budget, and what you love —
          get a complete, personalized itinerary in seconds.
        </p>
        <div className="hero__actions">
          <Link to="/register" className="btn btn--primary btn--lg">
            <Sparkles size={18} />
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn--outline btn--lg">
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-card__icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px 80px', background: 'var(--surface)' }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Ready to start planning?</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          Create a free account and generate your first AI itinerary in under a minute.
        </p>
        <Link to="/register" className="btn btn--primary btn--lg">Create Free Account</Link>
      </div>
    </div>
  )
}
