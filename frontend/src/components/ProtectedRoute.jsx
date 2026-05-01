import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children, role }) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="screen-loader">Loading your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "alumni" ? "/alumni-portal" : "/student"} replace />;
  }

  return children;
}
