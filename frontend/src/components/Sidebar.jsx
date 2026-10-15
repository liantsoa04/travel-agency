import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import Logo from "./Logo";

// Menu latéral de l'espace admin
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // "icon" = nom de l'icône dans components/Icon.jsx
  const liens = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/voyages", label: "Voyages", icon: "avion" },
    { to: "/admin/reservations", label: "Réservations", icon: "reservation" },
    { to: "/admin/clients", label: "Clients", icon: "clients" },
  ];
  if (user?.role === "admin") liens.push({ to: "/admin/utilisateurs", label: "Utilisateurs", icon: "utilisateurs" });
  liens.push({ to: "/admin/statistiques", label: "Statistiques", icon: "statistiques" });
  liens.push({ to: "/admin/parametres", label: "Paramètres", icon: "parametres" });

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo logo"><Logo suffixe="Admin" /></div>

        <p className="sidebar-title">Menu</p>
        <nav>
          {liens.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose}>
              <Icon name={l.icon} size={18} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/" onClick={onClose}>
            <Icon name="accueil" size={18} />
            <span>Voir le site</span>
          </NavLink>
          <button onClick={() => { logout(); navigate("/login"); }}>
            <Icon name="deconnexion" size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
