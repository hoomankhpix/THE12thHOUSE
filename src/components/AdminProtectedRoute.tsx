import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminProtectedRoute() {
  const { loading, session, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <div className="admin-state">Checking studio access...</div>
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <div className="admin-state"><p>Unauthorized access.</p><a href="/">Return to public site</a></div>
  return <Outlet />
}