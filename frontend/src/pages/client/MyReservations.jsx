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
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/reservations/");
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
      recharger();
    } catch (evenement) {
      setErreurAction(getErrorMessage(evenement));
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

      {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
        donnees.length === 0 ? (
          <EmptyState text="Vous n'avez pas encore de réservation.">
            <Link to="/voyages" className="btn btn-primary">Découvrir les voyages</Link>
          </EmptyState>
        ) : (
          <div className="resa-list">
            {donnees.map((reservation) => (
              <article key={reservation.id} className="resa-card">
                <SmartImage src={reservation.voyage_image} alt={reservation.voyage_titre} className="resa-img" />
                <div className="resa-body">
                  <div className="resa-top">
                    <h3>{reservation.voyage_destination}</h3>
                    <Badge info={STATUTS_RESERVATION[reservation.statut]} />
                  </div>
                  <p>{reservation.voyage_titre}</p>
                  <p className="muted resa-dates"><Icon name="calendrier" size={15} /> {formatDate(reservation.voyage_date_depart)} – {formatDate(reservation.voyage_date_retour)}</p>
                  <div className="resa-bottom">
                    <span>{reservation.nombre_personnes} personne(s)</span>
                    <strong>{formatPrix(reservation.prix_total)}</strong>
                    {reservation.statut !== "annulee" && (
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setAAnnuler(reservation)}>Annuler</button>
                    )}
                  </div>
                  <small className="muted">Réservé le {formatDate(reservation.date_reservation)}</small>
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
