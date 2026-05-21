import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null; // load hone tak wait karo
  return currentUser ? children : <Navigate to="/login" />;
}

export function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (userRole !== "admin") return <Navigate to="/dashboard" />;
  return children;
}