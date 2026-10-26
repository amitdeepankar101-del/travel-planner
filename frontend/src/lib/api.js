/**
 * lib/api.js — Axios instance pre-configured with base URL and auth header.
 *
 * Every API call in the app imports `api` from here.
 * The interceptor automatically attaches the JWT token from localStorage
 * to every request — you never need to add it manually in each component.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: if 401, clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Use window.location instead of React Router to avoid circular imports
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
