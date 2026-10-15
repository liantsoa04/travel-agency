import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import SmartImage from "../../components/SmartImage";
import Icon from "../../components/Icon";
import { Loader, ErrorState } from "../../components/States";
import { STATUTS_VOYAGE, categorieLabel, formatDate, formatPrix } from "../../utils/format";

export default function VoyageDetails() {
  const { id } = useParams();
  const { data: v, loading, error, reload } = useFetch(`/voyages/${id}/`);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const reservable = v.places_disponibles > 0 && v.statut !== "termine" && v.statut !== "complet";
  const taux = Math.round(((v.nombre_places - v.places_disponibles) / v.nombre_places) * 100);

  return (
    <div className="container page">
      <Link to="/voyages" className="back-link"><Icon name="retour" size={16} /> Retour aux voyages</Link>

      <div className="details-grid">
        <div>
          <SmartImage src={v.image} alt={v.titre} className="details-img" />
          <h2 className="details-h2">À propos de ce voyage</h2>
          <p className="details-desc">{v.description}</p>
        </div>

        <aside className="booking-box">
          <div className="booking-tags">
            <span className="voyage-cat static">{categorieLabel(v.categorie)}</span>
            <Badge info={STATUTS_VOYAGE[v.statut]} />
          </div>
          <h1>{v.titre}</h1>
          <p className="voyage-dest"><Icon name="lieu" size={15} /> {v.destination} — {v.ville}, {v.pays}</p>

          <p className="booking-prix">{formatPrix(v.prix)} <span>par personne</span></p>

          <dl className="booking-info">
            <div><dt>Départ</dt><dd>{formatDate(v.date_depart)}</dd></div>
            <div><dt>Retour</dt><dd>{formatDate(v.date_retour)}</dd></div>
            <div><dt>Places</dt><dd>{v.places_disponibles} sur {v.nombre_places}</dd></div>
          </dl>

          <div className="bar-track"><div className="bar-fill bar-orange" style={{ width: `${taux}%` }} /></div>
          <p className="muted small">{taux}% des places sont déjà réservées</p>

          {reservable ? (
            <Link to={`/voyages/${v.id}/reserver`} className="btn btn-primary btn-block btn-lg">Réserver maintenant</Link>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" disabled>
              {v.statut === "termine" ? "Voyage terminé" : "Voyage complet"}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
