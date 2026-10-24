import { useEffect, useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Loader, ErrorState } from "../../components/States";

export default function Profile() {
  const { updateUser } = useAuth();
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/clients/me/");
  const [formulaire, setForm] = useState({ prenom: "", nom: "", telephone: "", adresse: "" });
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);


  useEffect(() => {
    if (donnees) setForm({ prenom: donnees.prenom, nom: donnees.nom, telephone: donnees.telephone, adresse: donnees.adresse });
  }, [donnees]);

  if (chargement) return <Loader />;
  if (erreurApi) return <ErrorState message={erreurApi} onRetry={recharger} />;

  const change = (evenement) => setForm({ ...formulaire, [evenement.target.name]: evenement.target.value });

  async function submit(evenement) {
    evenement.preventDefault();
    setSucces("");
    setErreurGlobale("");
    const erreursValidees = {};
    if (!formulaire.prenom.trim()) erreursValidees.prenom = "Le prénom est obligatoire.";
    if (!formulaire.nom.trim()) erreursValidees.nom = "Le nom est obligatoire.";
    setErreurs(erreursValidees);
    if (Object.keys(erreursValidees).length) return;

    setEnvoi(true);
    try {
      await api.patch("/clients/me/", formulaire);
      updateUser({ first_name: formulaire.prenom, last_name: formulaire.nom });
      setSucces("Profil mis à jour avec succès.");
    } catch (erreurCapture) {
      setErreurs(getFieldErrors(erreurCapture));
      setErreurGlobale(getErrorMessage(erreurCapture));
    } finally {
      setEnvoi(false);
    }
  }

  const champ = (nomChamp, libelle) => (
    <div className="form-group">
      <label htmlFor={nomChamp}>{libelle}</label>
      <input id={nomChamp} name={nomChamp} value={formulaire[nomChamp]} onChange={change} />
      {erreurs[nomChamp] && <p className="field-error">{erreurs[nomChamp]}</p>}
    </div>
  );

  return (
    <div className="container page narrow">
      <h1 className="page-title">Mon profil</h1>
      <form className="card-form" onSubmit={submit} noValidate>
        <div className="profile-head">
          <div className="avatar avatar-lg">{(formulaire.prenom[0] || "?").toUpperCase()}</div>
          <div>
            <strong>{formulaire.prenom} {formulaire.nom}</strong>
            <p className="muted">{donnees.email}</p>
          </div>
        </div>

        <Alert type="error">{erreurGlobale}</Alert>
        <Alert type="success">{succes}</Alert>

        <div className="form-grid">
          {champ("prenom", "Prénom")}
          {champ("nom", "Nom")}
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" value={donnees.email} disabled />
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
