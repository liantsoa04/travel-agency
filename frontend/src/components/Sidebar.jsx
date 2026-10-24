import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import Logo from "./Logo";


export default function Sidebar({ open: ouvert, onClose: fermerAction }) {
  const { user: utilisateur, logout } = useAuth();
  const naviguer = useNavigate();


  const liens = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/voyages", label: "Voyages", icon: "avion" },
    { to: "/admin/reservations", label: "Réservations", icon: "reservation" },
    { to: "/admin/clients", label: "Clients", icon: "clients" },
  ];
  if (utilisateur?.role === "admin") liens.push({ to: "/admin/utilisateurs", label: "Utilisateurs", icon: "utilisateurs" });
  liens.push({ to: "/admin/statistiques", label: "Statistiques", icon: "statistiques" });
  liens.push({ to: "/admin/parametres", label: "Paramètres", icon: "parametres" });

  return (
    <>
      {ouvert && <div className="sidebar-backdrop" onClick={fermerAction} />}
      <aside className={`sidebar ${ouvert ? "open" : ""}`}>
        <div className="sidebar-logo logo"><Logo suffixe="Admin" /></div>

        <p className="sidebar-title">Menu</p>
        <nav>
          {liens.map((lien) => (
            <NavLink key={lien.to} to={lien.to} end={lien.end} onClick={fermerAction}>
              <Icon name={lien.icon} size={18} />
              <span>{lien.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/" onClick={fermerAction}>
            <Icon name="accueil" size={18} />
            <span>Voir le site</span>
          </NavLink>
          <button onClick={() => { logout(); naviguer("/login"); }}>
            <Icon name="deconnexion" size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
