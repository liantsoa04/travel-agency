import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



export default function ProtectedRoute({ children: contenu, clientSeulement = false }) {
  const { user: utilisateur } = useAuth();
  const emplacement = useLocation();

  if (!utilisateur) return <Navigate to="/login" state={{ from: emplacement.pathname }} replace />;
  if (clientSeulement && utilisateur.role !== "client") return <Navigate to="/admin" replace />;
  return contenu;
}
