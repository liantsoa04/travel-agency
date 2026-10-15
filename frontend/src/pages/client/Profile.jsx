import { useEffect, useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Loader, ErrorState } from "../../components/States";

export default function Profile() {
  const { updateUser } = useAuth();
  const { data, loading, error, reload } = useFetch("/clients/me/");
  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", adresse: "" });
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Quand les données arrivent, on remplit le formulaire
  useEffect(() => {
    if (data) setForm({ prenom: data.prenom, nom: data.nom, telephone: data.telephone, adresse: data.adresse });
  }, [data]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSucces("");
    setErreurGlobale("");
    const e1 = {};
    if (!form.prenom.trim()) e1.prenom = "Le prénom est obligatoire.";
    if (!form.nom.trim()) e1.nom = "Le nom est obligatoire.";
    setErreurs(e1);
    if (Object.keys(e1).length) return;

    setEnvoi(true);
    try {
      await api.patch("/clients/me/", form);
      updateUser({ first_name: form.prenom, last_name: form.nom });
      setSucces("Profil mis à jour avec succès.");
    } catch (err) {
      setErreurs(getFieldErrors(err));
      setErreurGlobale(getErrorMessage(err));
    } finally {
      setEnvoi(false);
    }
  }

  const champ = (name, label) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={form[name]} onChange={change} />
      {erreurs[name] && <p className="field-error">{erreurs[name]}</p>}
    </div>
  );

  return (
    <div className="container page narrow">
      <h1 className="page-title">Mon profil</h1>
      <form className="card-form" onSubmit={submit} noValidate>
        <div className="profile-head">
          <div className="avatar avatar-lg">{(form.prenom[0] || "?").toUpperCase()}</div>
          <div>
            <strong>{form.prenom} {form.nom}</strong>
            <p className="muted">{data.email}</p>
          </div>
        </div>

        <Alert type="error">{erreurGlobale}</Alert>
        <Alert type="success">{succes}</Alert>

        <div className="form-grid">
          {champ("prenom", "Prénom")}
          {champ("nom", "Nom")}
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" value={data.email} disabled />
            <p className="muted small">L'e-mail ne peut pas être modifié.</p>
          </div>
          {champ("telephone", "Téléphone")}
        </div>
        {champ("adresse", "Adresse")}

        <button className="btn btn-primary" disabled={envoi}>{envoi ? "Enregistrement..." : "Enregistrer les modifications"}</button>
      </form>
    </div>
  );
}
