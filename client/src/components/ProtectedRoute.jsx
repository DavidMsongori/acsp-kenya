
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const {
    isAuthenticated,
    loading,
    hasRole,
  } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        Loading...
      </div>
    );
  }

  // Require authentication.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role restrictions only when specified.
  if (
    allowedRoles.length > 0 &&
    !hasRole(...allowedRoles)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
