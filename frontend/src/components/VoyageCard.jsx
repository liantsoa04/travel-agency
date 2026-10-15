import { Link } from "react-router-dom";
import SmartImage from "./SmartImage";
import Badge from "./Badge";
import Icon from "./Icon";
import { STATUTS_VOYAGE, categorieLabel, formatDateCourte, formatPrix } from "../utils/format";

// Carte d'un voyage (côté client)
export default function VoyageCard({ voyage }) {
  return (
    <article className="voyage-card">
      <div className="voyage-card-img">
        <SmartImage src={voyage.image} alt={voyage.titre} />
        <span className="voyage-cat">{categorieLabel(voyage.categorie)}</span>
        <Badge info={STATUTS_VOYAGE[voyage.statut]} />
      </div>
      <div className="voyage-card-body">
        <h3>{voyage.titre}</h3>
        <p className="voyage-dest"><Icon name="lieu" size={15} /> {voyage.ville}, {voyage.pays}</p>
        <p className="voyage-dates">
          <Icon name="calendrier" size={15} /> {formatDateCourte(voyage.date_depart)} – {formatDateCourte(voyage.date_retour)}
        </p>
        <div className="voyage-card-footer">
          <div>
            <p className="voyage-prix">{formatPrix(voyage.prix)}</p>
            <p className="voyage-places">
              {voyage.places_disponibles > 0 ? `${voyage.places_disponibles} places restantes` : "Plus de places"}
            </p>
          </div>
          <Link to={`/voyages/${voyage.id}`} className="btn btn-primary btn-sm">Voir le voyage</Link>
        </div>
      </div>
    </article>
  );
}
