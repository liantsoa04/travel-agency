import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import Logo from "./Logo";


export default function Navbar() {
  const { user: utilisateur, isStaff: estPersonnel, logout } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const naviguer = useNavigate();

  const fermer = () => setOuvert(false);
  const seDeconnecter = () => {
    logout();
    fermer();
    naviguer("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={fermer}><Logo /></Link>

        <button className="burger" onClick={() => setOuvert(!ouvert)} aria-label="Menu">
          <Icon name={ouvert ? "fermer" : "menu"} size={22} />
        </button>

        <nav className={`nav-links ${ouvert ? "open" : ""}`}>
          <NavLink to="/" end onClick={fermer}>Accueil</NavLink>
          <NavLink to="/voyages" onClick={fermer}>Voyages</NavLink>
          {utilisateur?.role === "client" && (
            <>
              <NavLink to="/mes-reservations" onClick={fermer}>Mes réservations</NavLink>
              <NavLink to="/profil" onClick={fermer}>Mon profil</NavLink>
            </>
          )}
          {estPersonnel && <NavLink to="/admin" onClick={fermer}>Espace admin</NavLink>}

          {utilisateur ? (
            <button className="btn btn-outline btn-sm" onClick={seDeconnecter}>Déconnexion</button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={fermer}>Connexion</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
