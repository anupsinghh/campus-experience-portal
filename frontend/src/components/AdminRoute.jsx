import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname, openLogin: true }}
      />
    );
  }

  const isStaff = ['admin', 'coordinator', 'teacher'].includes(user?.role);
  if (!isStaff) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ error: 'Access denied. Staff privileges required.' }}
      />
    );
  }

  return children;
}

export default AdminRoute;

