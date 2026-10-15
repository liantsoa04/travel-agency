import { useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../services/api";
import { CATEGORIES } from "../utils/format";
import Alert from "./Alert";

const VIDE = {
  titre: "", destination: "", pays: "", ville: "", description: "",
  date_depart: "", date_retour: "", prix: "", nombre_places: "",
  categorie: "plage", image: "",
};

// Formulaire d'ajout / modification d'un voyage (voyage = null -> ajout)
export default function VoyageForm({ voyage, onSaved, onCancel }) {
  const [form, setForm] = useState(voyage ? { ...VIDE, ...voyage } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validations simples côté React (Django revérifie aussi)
  function valider() {
    const e = {};
    ["titre", "destination", "pays", "ville", "description"].forEach((c) => {
      if (!String(form[c]).trim()) e[c] = "Ce champ est obligatoire.";
    });
    if (!form.date_depart) e.date_depart = "Date de départ obligatoire.";
    if (!form.date_retour) e.date_retour = "Date de retour obligatoire.";
    if (form.date_depart && form.date_retour && form.date_retour <= form.date_depart)
      e.date_retour = "La date de retour doit être après la date de départ.";
    if (!(Number(form.prix) > 0)) e.prix = "Le prix doit être positif.";
    if (!(Number(form.nombre_places) > 0)) e.nombre_places = "Le nombre de places doit être positif.";
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const e1 = valider();
    setErreurs(e1);
    if (Object.keys(e1).length) return;

    setLoading(true);
    setErreurGlobale("");
    const donnees = {
      titre: form.titre, destination: form.destination, pays: form.pays, ville: form.ville,
      description: form.description, date_depart: form.date_depart, date_retour: form.date_retour,
      prix: form.prix, nombre_places: form.nombre_places, categorie: form.categorie, image: form.image,
    };
    try {
      if (voyage) await api.put(`/voyages/${voyage.id}/`, donnees);
      else await api.post("/voyages/", donnees);
      onSaved();
    } catch (err) {
      setErreurs(getFieldErrors(err));
      setErreurGlobale(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const champ = (name, label, type = "text", extra = {}) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} {...extra} />
      {erreurs[name] && <p className="field-error">{erreurs[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <Alert type="error">{erreurGlobale}</Alert>
      <div className="form-grid">
        {champ("titre", "Titre")}
        {champ("destination", "Destination")}
        {champ("pays", "Pays")}
        {champ("ville", "Ville")}
        {champ("date_depart", "Date de départ", "date")}
        {champ("date_retour", "Date de retour", "date")}
        {champ("prix", "Prix par personne (€)", "number", { min: 1, step: "0.01" })}
        {champ("nombre_places", "Nombre de places", "number", { min: 1 })}
        <div className="form-group">
          <label htmlFor="categorie">Catégorie</label>
          <select id="categorie" name="categorie" value={form.categorie} onChange={change}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {champ("image", "Lien de l'image (URL)", "url", { placeholder: "https://..." })}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="4" value={form.description} onChange={change} />
        {erreurs.description && <p className="field-error">{erreurs.description}</p>}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement..." : voyage ? "Enregistrer les modifications" : "Ajouter le voyage"}
        </button>
      </div>
    </form>
  );
}
