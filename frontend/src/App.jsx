/**
 * App.jsx — Root component with routing configuration.
 *
 * Route map:
 *   /             → Landing page (public)
 *   /login        → Login form (public)
 *   /register     → Registration form (public)
 *   /dashboard    → My trips list (protected)
 *   /plan         → New trip form (protected)
 *   /trips/:id    → Itinerary detail (protected)
 *
 * Protected routes redirect to /login if the user is not authenticated.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TravelFormPage from './pages/TravelFormPage'
import ItineraryPage from './pages/ItineraryPage'

function AppRoutes() {
  const { isLoggedIn } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><TravelFormPage /></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><ItineraryPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        {/* Toast notifications — shown in top-right corner */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: 14 },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
