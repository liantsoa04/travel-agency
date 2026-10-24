import { useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../services/api";
import { CATEGORIES } from "../utils/format";
import Alert from "./Alert";

const VIDE = {
  titre: "", destination: "", pays: "", ville: "", description: "",
  date_depart: "", date_retour: "", prix: "", nombre_places: "",
  categorie: "plage", image: "",
};


export default function VoyageForm({ voyage, onSaved: apresEnregistrement, onCancel: annulerAction }) {
  const [formulaire, setForm] = useState(voyage ? { ...VIDE, ...voyage } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [chargement, definirChargement] = useState(false);

  const change = (evenement) => setForm({ ...formulaire, [evenement.target.name]: evenement.target.value });


  function valider() {
    const evenement = {};
    ["titre", "destination", "pays", "ville", "description"].forEach((categorie) => {
      if (!String(formulaire[categorie]).trim()) evenement[categorie] = "Ce champ est obligatoire.";
    });
    if (!formulaire.date_depart) evenement.date_depart = "Date de départ obligatoire.";
    if (!formulaire.date_retour) evenement.date_retour = "Date de retour obligatoire.";
    if (formulaire.date_depart && formulaire.date_retour && formulaire.date_retour <= formulaire.date_depart)
      evenement.date_retour = "La date de retour doit être après la date de départ.";
    if (!(Number(formulaire.prix) > 0)) evenement.prix = "Le prix doit être positif.";
    if (!(Number(formulaire.nombre_places) > 0)) evenement.nombre_places = "Le nombre de places doit être positif.";
    return evenement;
  }

  async function submit(evenement) {
    evenement.preventDefault();
    const erreursValidees = valider();
    setErreurs(erreursValidees);
    if (Object.keys(erreursValidees).length) return;

    definirChargement(true);
    setErreurGlobale("");
    const donnees = {
      titre: formulaire.titre, destination: formulaire.destination, pays: formulaire.pays, ville: formulaire.ville,
      description: formulaire.description, date_depart: formulaire.date_depart, date_retour: formulaire.date_retour,
      prix: formulaire.prix, nombre_places: formulaire.nombre_places, categorie: formulaire.categorie, image: formulaire.image,
    };
    try {
      if (voyage) await api.put(`/voyages/${voyage.id}/`, donnees);
      else await api.post("/voyages/", donnees);
      apresEnregistrement();
    } catch (erreurCapture) {
      setErreurs(getFieldErrors(erreurCapture));
      setErreurGlobale(getErrorMessage(erreurCapture));
    } finally {
      definirChargement(false);
    }
  }

  const champ = (nomChamp, libelle, type = "text", optionsSupplementaires = {}) => (
    <div className="form-group">
      <label htmlFor={nomChamp}>{libelle}</label>
      <input id={nomChamp} name={nomChamp} type={type} value={formulaire[nomChamp]} onChange={change} {...optionsSupplementaires} />
      {erreurs[nomChamp] && <p className="field-error">{erreurs[nomChamp]}</p>}
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
        {champ("prix", "Prix par personne (Ar)", "number", { min: 1, step: "0.01" })}
        {champ("nombre_places", "Nombre de places", "number", { min: 1 })}
        <div className="form-group">
          <label htmlFor="categorie">Catégorie</label>
          <select id="categorie" name="categorie" value={formulaire.categorie} onChange={change}>
            {CATEGORIES.map((categorie) => <option key={categorie.value} value={categorie.value}>{categorie.label}</option>)}
          </select>
        </div>
        {champ("image", "Lien de l'image (URL)", "url", { placeholder: "https://..." })}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="4" value={formulaire.description} onChange={change} />
        {erreurs.description && <p className="field-error">{erreurs.description}</p>}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={annulerAction}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={chargement}>
          {chargement ? "Enregistrement..." : voyage ? "Enregistrer les modifications" : "Ajouter le voyage"}
        </button>
      </div>
    </form>
  );
}
