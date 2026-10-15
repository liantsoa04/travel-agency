import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import SmartImage from "../../components/SmartImage";
import ConfirmModal from "../../components/ConfirmModal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import { Loader, EmptyState, ErrorState } from "../../components/States";
import { STATUTS_RESERVATION, formatDate, formatPrix } from "../../utils/format";

export default function MyReservations() {
  const { data, loading, error, reload } = useFetch("/reservations/");
  const [aAnnuler, setAAnnuler] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function annuler() {
    setEnCours(true);
    try {
      await api.post(`/reservations/${aAnnuler.id}/annuler/`);
      setMessage("Votre réservation a été annulée.");
      setAAnnuler(null);
      reload();
    } catch (e) {
      setErreurAction(getErrorMessage(e));
      setAAnnuler(null);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Mes réservations</h1>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={reload} /> :
        data.length === 0 ? (
          <EmptyState text="Vous n'avez pas encore de réservation.">
            <Link to="/voyages" className="btn btn-primary">Découvrir les voyages</Link>
          </EmptyState>
        ) : (
          <div className="resa-list">
            {data.map((r) => (
              <article key={r.id} className="resa-card">
                <SmartImage src={r.voyage_image} alt={r.voyage_titre} className="resa-img" />
                <div className="resa-body">
                  <div className="resa-top">
                    <h3>{r.voyage_destination}</h3>
                    <Badge info={STATUTS_RESERVATION[r.statut]} />
                  </div>
                  <p>{r.voyage_titre}</p>
                  <p className="muted resa-dates"><Icon name="calendrier" size={15} /> {formatDate(r.voyage_date_depart)} – {formatDate(r.voyage_date_retour)}</p>
                  <div className="resa-bottom">
                    <span>{r.nombre_personnes} personne(s)</span>
                    <strong>{formatPrix(r.prix_total)}</strong>
                    {r.statut !== "annulee" && (
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setAAnnuler(r)}>Annuler</button>
                    )}
                  </div>
                  <small className="muted">Réservé le {formatDate(r.date_reservation)}</small>
                </div>
              </article>
            ))}
          </div>
        )}

      {aAnnuler && (
        <ConfirmModal
          message={`Voulez-vous vraiment annuler votre réservation pour ${aAnnuler.voyage_destination} ?`}
          confirmLabel="Annuler la réservation"
          loading={enCours}
          onConfirm={annuler}
          onCancel={() => setAAnnuler(null)}
        />
      )}
    </div>
  );
}
