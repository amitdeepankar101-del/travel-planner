/**
 * components/Navbar.jsx — Top navigation bar.
 *
 * Shows brand logo on the left.
 * If logged in: shows user name + logout button.
 * If not logged in: shows Login and Register buttons.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plane, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to={isLoggedIn ? '/dashboard' : '/'} className="navbar__brand">
        <Plane size={22} />
        AI Travel Planner
      </Link>

      <div className="navbar__actions">
        {isLoggedIn ? (
          <>
            <span style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} />
              {user?.full_name || user?.email}
            </span>
            <button className="btn btn--outline btn--sm" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--outline btn--sm">Login</Link>
            <Link to="/register" className="btn btn--primary btn--sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
