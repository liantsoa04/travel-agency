import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage, getFieldErrors } from "../../services/api";
import Alert from "../../components/Alert";
import Logo from "../../components/Logo";

export default function Register() {
  const { user: utilisateur, register } = useAuth();
  const naviguer = useNavigate();
  const [formulaire, setForm] = useState({
    first_name: "", last_name: "", email: "", telephone: "", adresse: "", password: "", confirmation: "",
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [chargement, definirChargement] = useState(false);

  if (utilisateur) return <Navigate to="/" replace />;

  const change = (evenement) => setForm({ ...formulaire, [evenement.target.name]: evenement.target.value });

  async function submit(evenement) {
    evenement.preventDefault();
    const erreursValidees = {};
    if (!formulaire.first_name.trim()) erreursValidees.first_name = "Le prénom est obligatoire.";
    if (!formulaire.last_name.trim()) erreursValidees.last_name = "Le nom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(formulaire.email)) erreursValidees.email = "Adresse e-mail invalide.";
    if (formulaire.password.length < 6) erreursValidees.password = "Au moins 6 caractères.";
    if (formulaire.password !== formulaire.confirmation) erreursValidees.confirmation = "Les mots de passe ne correspondent pas.";
    setErreurs(erreursValidees);
    if (Object.keys(erreursValidees).length) return;

    definirChargement(true);
    setErreurGlobale("");
    try {
      const { confirmation, ...donnees } = formulaire;
      await register(donnees);
      naviguer("/", { replace: true });
    } catch (erreurCapture) {
      setErreurs(getFieldErrors(erreurCapture));
      setErreurGlobale(getErrorMessage(erreurCapture));
    } finally {
      definirChargement(false);
    }
  }

  const champ = (nomChamp, libelle, type = "text") => (
    <div className="form-group">
      <label htmlFor={nomChamp}>{libelle}</label>
      <input id={nomChamp} name={nomChamp} type={type} value={formulaire[nomChamp]} onChange={change} />
      {erreurs[nomChamp] && <p className="field-error">{erreurs[nomChamp]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="logo"><Logo /></Link>
        <h2>Créez votre compte voyageur.</h2>
        <p>Réservez en quelques clics et retrouvez toutes vos réservations au même endroit.</p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Inscription</h1>
          <Alert type="error">{erreurGlobale}</Alert>
          <div className="form-grid">
            {champ("first_name", "Prénom")}
            {champ("last_name", "Nom")}
          </div>
          {champ("email", "Adresse e-mail", "email")}
          {champ("telephone", "Téléphone")}
          {champ("adresse", "Adresse")}
          <div className="form-grid">
            {champ("password", "Mot de passe", "password")}
            {champ("confirmation", "Confirmer le mot de passe", "password")}
          </div>
          <button className="btn btn-primary btn-block" disabled={chargement}>
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
          <p className="auth-switch">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        </form>
      </div>
    </div>
  );
}
