import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Page privée : il faut être connecté.
// clientOnly : réservé aux clients (le personnel est renvoyé vers l'admin).
export default function ProtectedRoute({ children, clientOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (clientOnly && user.role !== "client") return <Navigate to="/admin" replace />;
  return children;
}
