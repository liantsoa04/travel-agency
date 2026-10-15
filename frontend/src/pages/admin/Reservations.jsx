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
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const recherche = useDebounce(search);
  const { data, loading, error, reload } = useFetch("/reservations/", { search: recherche, statut });
  const pagination = usePagination(data ?? [], JSON.stringify([recherche, statut]));

  const [detail, setDetail] = useState(null);
  const [aAnnuler, setAAnnuler] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [enCours, setEnCours] = useState(false);

  // Confirmer ou annuler une réservation (les places sont gérées par Django)
  async function changerStatut(reservation, action) {
    setEnCours(true);
    setErreurAction("");
    try {
      await api.post(`/reservations/${reservation.id}/${action}/`);
      setMessage(action === "confirmer" ? "Réservation confirmée : les places ont été mises à jour." : "Réservation annulée.");
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
    <div>
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Client ou voyage..." />
        <select value={statut} onChange={(e) => setStatut(e.target.value)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_RESERVATION).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
        </select>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState text="Aucune réservation trouvée." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Client</th><th>Voyage</th><th>Date</th><th>Pers.</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pagination.items.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.client_nom}</strong><small>{r.client_email}</small></td>
                      <td>{r.voyage_titre}</td>
                      <td>{formatDate(r.date_reservation)}</td>
                      <td>{r.nombre_personnes}</td>
                      <td>{formatPrix(r.prix_total)}</td>
                      <td><Badge info={STATUTS_RESERVATION[r.statut]} /></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setDetail(r)}>Détails</button>
                          {r.statut === "en_attente" && (
                            <button className="btn btn-primary btn-sm" disabled={enCours} onClick={() => changerStatut(r, "confirmer")}>Confirmer</button>
                          )}
                          {r.statut !== "annulee" && (
                            <button className="btn btn-danger-outline btn-sm" onClick={() => setAAnnuler(r)}>Annuler</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} count={data.length} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
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
