import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

export default function ClientLayout() {
  return (
    <div className="client-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <p className="logo"><Logo /></p>
            <p>Votre agence de voyage à Madagascar et dans le monde.</p>
          </div>
          <div>
            <strong>Navigation</strong>
            <Link to="/">Accueil</Link>
            <Link to="/voyages">Voyages</Link>
            <Link to="/mes-reservations">Mes réservations</Link>
          </div>
          <div>
            <strong>Contact</strong>
            <p>contact@horizon-voyages.mg</p>
            <p>+261 34 00 000 00</p>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Horizon Voyages — Projet universitaire</p>
      </footer>
    </div>
  );
}
