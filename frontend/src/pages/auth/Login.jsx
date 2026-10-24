import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import Alert from "../../components/Alert";
import Logo from "../../components/Logo";

export default function Login() {
  const { user: utilisateur, login } = useAuth();
  const naviguer = useNavigate();
  const emplacement = useLocation();
  const [adresseCourriel, definirAdresseCourriel] = useState("");
  const [motDePasse, definirMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, definirChargement] = useState(false);


  if (utilisateur) return <Navigate to={homePathFor(utilisateur)} replace />;

  async function submit(evenement) {
    evenement.preventDefault();
    setErreur("");
    if (!adresseCourriel || !motDePasse) return setErreur("Veuillez saisir votre e-mail et votre mot de passe.");
    definirChargement(true);
    try {
      const connecte = await login(adresseCourriel, motDePasse);

      const retour = emplacement.state?.from;
      if (connecte.role === "client") naviguer(retour || "/", { replace: true });
      else naviguer("/admin", { replace: true });
    } catch (erreurCapture) {
      if (erreurCapture.response?.status === 401) setErreur("E-mail ou mot de passe incorrect.");
      else setErreur(getErrorMessage(erreurCapture));
    } finally {
      definirChargement(false);
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
            <input id="email" type="email" value={adresseCourriel} onChange={(evenement) => definirAdresseCourriel(evenement.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={motDePasse} onChange={(evenement) => definirMotDePasse(evenement.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-block" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
          <p className="auth-switch">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
        </form>
      </div>
    </div>
  );
}
