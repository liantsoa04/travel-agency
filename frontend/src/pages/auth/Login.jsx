import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import Alert from "../../components/Alert";
import Logo from "../../components/Logo";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  // Déjà connecté : on renvoie vers le bon espace
  if (user) return <Navigate to={homePathFor(user)} replace />;

  async function submit(e) {
    e.preventDefault();
    setErreur("");
    if (!email || !password) return setErreur("Veuillez saisir votre e-mail et votre mot de passe.");
    setLoading(true);
    try {
      const connecte = await login(email, password);
      // Client -> espace client / Admin et employé -> dashboard admin
      const retour = location.state?.from;
      if (connecte.role === "client") navigate(retour || "/", { replace: true });
      else navigate("/admin", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) setErreur("E-mail ou mot de passe incorrect.");
      else setErreur(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="logo"><Logo /></Link>
        <h2>Votre prochaine aventure commence ici.</h2>
        <p>Connectez-vous pour réserver vos voyages et suivre vos réservations.</p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Connexion</h1>
          <Alert type="error">{erreur}</Alert>
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="auth-switch">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
        </form>
      </div>
    </div>
  );
}
