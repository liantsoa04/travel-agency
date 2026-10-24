import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



export default function AdminRoute({ children: contenu, adminOnly: administrateurSeulement = false }) {
  const { user: utilisateur, isStaff: estPersonnel } = useAuth();
  const emplacement = useLocation();

  if (!utilisateur) return <Navigate to="/login" state={{ from: emplacement.pathname }} replace />;
  if (!estPersonnel) return <Navigate to="/" replace />;
  if (administrateurSeulement && utilisateur.role !== "admin") return <Navigate to="/admin" replace />;
  return contenu;
}
