import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import SearchBar from "../../components/SearchBar";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { Pagination, usePagination } from "../../components/Pagination";
import Alert from "../../components/Alert";
import { Loader, EmptyState, ErrorState } from "../../components/States";
import { STATUTS_RESERVATION, formatDate, formatPrix } from "../../utils/format";

export default function AdminReservations() {
  const [search, definirRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const recherche = useDebounce(search);
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/reservations/", { search: recherche, statut });
  const pagination = usePagination(donnees ?? [], JSON.stringify([recherche, statut]));

  const [detail, setDetail] = useState(null);
  const [aAnnuler, setAAnnuler] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [enCours, setEnCours] = useState(false);


  async function changerStatut(reservation, action) {
    setEnCours(true);
    setErreurAction("");
    try {
      await api.post(`/reservations/${reservation.id}/${action}/`);
      setMessage(action === "confirmer" ? "Réservation confirmée : les places ont été mises à jour." : "Réservation annulée.");
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
    <div>
      <div className="toolbar">
        <SearchBar value={search} onChange={definirRecherche} placeholder="Client ou voyage..." />
        <select value={statut} onChange={(evenement) => setStatut(evenement.target.value)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_RESERVATION).map(([voyage, statut]) => <option key={voyage} value={voyage}>{statut.label}</option>)}
        </select>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
          donnees.length === 0 ? <EmptyState text="Aucune réservation trouvée." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Client</th><th>Voyage</th><th>Date</th><th>Pers.</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pagination.items.map((reservation) => (
                    <tr key={reservation.id}>
                      <td><strong>{reservation.client_nom}</strong><small>{reservation.client_email}</small></td>
                      <td>{reservation.voyage_titre}</td>
                      <td>{formatDate(reservation.date_reservation)}</td>
                      <td>{reservation.nombre_personnes}</td>
                      <td>{formatPrix(reservation.prix_total)}</td>
                      <td><Badge info={STATUTS_RESERVATION[reservation.statut]} /></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setDetail(reservation)}>Détails</button>
                          {reservation.statut === "en_attente" && (
                            <button className="btn btn-primary btn-sm" disabled={enCours} onClick={() => changerStatut(reservation, "confirmer")}>Confirmer</button>
                          )}
                          {reservation.statut !== "annulee" && (
                            <button className="btn btn-danger-outline btn-sm" onClick={() => setAAnnuler(reservation)}>Annuler</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} count={donnees.length} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
            </>
          )}
      </section>

      {detail && (
        <Modal title={`Réservation n°${detail.id}`} onClose={() => setDetail(null)}>
          <dl className="detail-list">
            <div><dt>Client</dt><dd>{detail.client_nom} ({detail.client_email})</dd></div>
            <div><dt>Voyage</dt><dd>{detail.voyage_titre} — {detail.voyage_destination}</dd></div>
            <div><dt>Dates du voyage</dt><dd>{formatDate(detail.voyage_date_depart)} → {formatDate(detail.voyage_date_retour)}</dd></div>
            <div><dt>Réservé le</dt><dd>{formatDate(detail.date_reservation)}</dd></div>
            <div><dt>Calcul</dt><dd>{formatPrix(detail.voyage_prix)} × {detail.nombre_personnes} personne(s)</dd></div>
            <div><dt>Total</dt><dd><strong>{formatPrix(detail.prix_total)}</strong></dd></div>
            <div><dt>Statut</dt><dd><Badge info={STATUTS_RESERVATION[detail.statut]} /></dd></div>
          </dl>
        </Modal>
      )}

      {aAnnuler && (
        <ConfirmModal
          message="Voulez-vous vraiment annuler cette réservation ? Si elle était confirmée, les places seront rendues au voyage."
          confirmLabel="Annuler la réservation"
          loading={enCours}
          onConfirm={() => changerStatut(aAnnuler, "annuler")}
          onCancel={() => setAAnnuler(null)}
        />
      )}
    </div>
  );
}
