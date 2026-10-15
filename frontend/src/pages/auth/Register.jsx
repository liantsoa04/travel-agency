import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage, getFieldErrors } from "../../services/api";
import Alert from "../../components/Alert";
import Logo from "../../components/Logo";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", telephone: "", adresse: "", password: "", confirmation: "",
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const e1 = {};
    if (!form.first_name.trim()) e1.first_name = "Le prénom est obligatoire.";
    if (!form.last_name.trim()) e1.last_name = "Le nom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e1.email = "Adresse e-mail invalide.";
    if (form.password.length < 6) e1.password = "Au moins 6 caractères.";
    if (form.password !== form.confirmation) e1.confirmation = "Les mots de passe ne correspondent pas.";
    setErreurs(e1);
    if (Object.keys(e1).length) return;

    setLoading(true);
    setErreurGlobale("");
    try {
      const { confirmation, ...donnees } = form;
      await register(donnees);              // crée le compte puis connecte
      navigate("/", { replace: true });
    } catch (err) {
      setErreurs(getFieldErrors(err));
      setErreurGlobale(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const champ = (name, label, type = "text") => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} />
      {erreurs[name] && <p className="field-error">{erreurs[name]}</p>}
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
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="auth-switch">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        </form>
      </div>
    </div>
  );
}
