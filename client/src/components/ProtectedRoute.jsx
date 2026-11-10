
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  allowedRoles = [],
  redirectTo = "/dashboard",
}) => {
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

  // Enforce role restrictions.
  if (
    allowedRoles.length > 0 &&
    !hasRole(...allowedRoles)
  ) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
