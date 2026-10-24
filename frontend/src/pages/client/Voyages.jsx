import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import VoyageCard from "../../components/VoyageCard";
import SearchBar from "../../components/SearchBar";
import { Loader, EmptyState, ErrorState } from "../../components/States";
import { CATEGORIES } from "../../utils/format";

export default function Voyages() {
  const [parametres] = useSearchParams();
  const [search, definirRecherche] = useState(parametres.get("search") || "");
  const [categorie, setCategorie] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [date, setDate] = useState("");
  const [disponible, setDisponible] = useState(false);
  const recherche = useDebounce(search);

  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/voyages/", {
    search: recherche,
    categorie,
    prix_min: prixMin,
    prix_max: prixMax,
    date,
    disponible: disponible ? "true" : "",
  });

  function reinitialiser() {
    definirRecherche(""); setCategorie(""); setPrixMin(""); setPrixMax(""); setDate(""); setDisponible(false);
  }

  return (
    <div className="container page">
      <h1 className="page-title">Nos voyages</h1>
      <p className="page-subtitle">Où voulez-vous partir ? Filtrez par destination, budget ou date de départ.</p>

      <div className="filters">
        <SearchBar value={search} onChange={definirRecherche} placeholder="Destination, pays ou ville..." />
        <div className="filters-row">
          <div className="form-group">
            <label htmlFor="cat">Catégorie</label>
            <select id="cat" value={categorie} onChange={(evenement) => setCategorie(evenement.target.value)}>
              <option value="">Toutes</option>
              {CATEGORIES.map((categorie) => <option key={categorie.value} value={categorie.value}>{categorie.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pmin">Prix min (Ar)</label>
            <input id="pmin" type="number" min="0" value={prixMin} onChange={(evenement) => setPrixMin(evenement.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="pmax">Prix max (Ar)</label>
            <input id="pmax" type="number" min="0" value={prixMax} onChange={(evenement) => setPrixMax(evenement.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="date">Départ à partir du</label>
            <input id="date" type="date" value={date} onChange={(evenement) => setDate(evenement.target.value)} />
          </div>
          <label className="check">
            <input type="checkbox" checked={disponible} onChange={(evenement) => setDisponible(evenement.target.checked)} />
            Places disponibles uniquement
          </label>
          <button className="btn btn-outline btn-sm" onClick={reinitialiser}>Réinitialiser</button>
        </div>
      </div>

      {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
        donnees.length === 0 ? (
          <EmptyState text="Aucun voyage trouvé.">
            <button className="btn btn-outline" onClick={reinitialiser}>Effacer les filtres</button>
          </EmptyState>
        ) : (
          <>
            <p className="result-count">{donnees.length} voyage(s) trouvé(s)</p>
            <div className="voyage-grid">
              {donnees.map((voyage) => <VoyageCard key={voyage.id} voyage={voyage} />)}
            </div>
          </>
        )}
    </div>
  );
}
