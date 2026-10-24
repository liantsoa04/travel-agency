import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import SmartImage from "../../components/SmartImage";
import Icon from "../../components/Icon";
import { Loader, ErrorState } from "../../components/States";
import { STATUTS_VOYAGE, categorieLabel, formatDate, formatPrix } from "../../utils/format";

export default function VoyageDetails() {
  const { id: identifiant } = useParams();
  const { data: voyage, loading: chargement, error: erreurApi, reload: recharger } = useFetch(`/voyages/${identifiant}/`);

  if (chargement) return <Loader />;
  if (erreurApi) return <ErrorState message={erreurApi} onRetry={recharger} />;

  const reservable = voyage.places_disponibles > 0 && voyage.statut !== "termine" && voyage.statut !== "complet";
  const taux = Math.round(((voyage.nombre_places - voyage.places_disponibles) / voyage.nombre_places) * 100);

  return (
    <div className="container page">
      <Link to="/voyages" className="back-link"><Icon name="retour" size={16} /> Retour aux voyages</Link>

      <div className="details-grid">
        <div>
          <SmartImage src={voyage.image} alt={voyage.titre} className="details-img" />
          <h2 className="details-h2">À propos de ce voyage</h2>
          <p className="details-desc">{voyage.description}</p>
        </div>

        <aside className="booking-box">
          <div className="booking-tags">
            <span className="voyage-cat static">{categorieLabel(voyage.categorie)}</span>
            <Badge info={STATUTS_VOYAGE[voyage.statut]} />
          </div>
          <h1>{voyage.titre}</h1>
          <p className="voyage-dest"><Icon name="lieu" size={15} /> {voyage.destination} — {voyage.ville}, {voyage.pays}</p>

          <p className="booking-prix">{formatPrix(voyage.prix)} <span>par personne</span></p>

          <dl className="booking-info">
            <div><dt>Départ</dt><dd>{formatDate(voyage.date_depart)}</dd></div>
            <div><dt>Retour</dt><dd>{formatDate(voyage.date_retour)}</dd></div>
            <div><dt>Places</dt><dd>{voyage.places_disponibles} sur {voyage.nombre_places}</dd></div>
          </dl>

          <div className="bar-track"><div className="bar-fill bar-orange" style={{ width: `${taux}%` }} /></div>
          <p className="muted small">{taux}% des places sont déjà réservées</p>

          {reservable ? (
            <Link to={`/voyages/${voyage.id}/reserver`} className="btn btn-primary btn-block btn-lg">Réserver maintenant</Link>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" disabled>
              {voyage.statut === "termine" ? "Voyage terminé" : "Voyage complet"}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
