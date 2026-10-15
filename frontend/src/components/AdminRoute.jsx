import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Page d'administration : réservée à l'admin et à l'employé.
// adminOnly : réservée uniquement à l'admin (ex : gestion des utilisateurs).
export default function AdminRoute({ children, adminOnly = false }) {
  const { user, isStaff } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isStaff) return <Navigate to="/" replace />;                 // un client n'entre pas ici
  if (adminOnly && user.role !== "admin") return <Navigate to="/admin" replace />;
  return children;
}
