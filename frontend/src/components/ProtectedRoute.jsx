import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wrap any route that requires authentication.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
 *     ...nested routes...
 *   </Route>
 *
 * Unauthenticated users are redirected to /get-started.
 * The original path is saved in location.state so GetStarted can redirect
 * back after a successful login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/get-started"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return children
}
