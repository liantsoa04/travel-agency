import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { Loader, ErrorState } from "../../components/States";
import { ReservationsChart, RevenueChart } from "../../components/Charts";
import { Pagination, usePagination } from "../../components/Pagination";
import { STATUTS_RESERVATION, formatDate, formatPrix } from "../../utils/format";

export default function Dashboard() {
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/dashboard/stats/");
  const pagination = usePagination(donnees?.reservations_recentes ?? []);

  if (chargement) return <Loader />;
  if (erreurApi) return <ErrorState message={erreurApi} onRetry={recharger} />;

  const { cartes, mensuel, voyages_populaires, reservations_recentes, alertes } = donnees;

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Voyages" value={cartes.voyages.total} variation={cartes.voyages.variation} icon="avion" color="green" />
        <StatCard label="Clients" value={cartes.clients.total} variation={cartes.clients.variation} icon="clients" color="orange" />
        <StatCard label="Réservations" value={cartes.reservations.total} variation={cartes.reservations.variation} icon="reservation" color="sand" />
        <StatCard label="Chiffre d'affaires" value={formatPrix(cartes.revenus.total)} variation={cartes.revenus.variation} icon="portefeuille" color="orange" />
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Réservations par mois</h2>
          <ReservationsChart data={mensuel} />
        </section>
        <section className="panel">
          <h2>Revenus par mois</h2>
          <RevenueChart data={mensuel} />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Voyages populaires</h2>
          <ul className="rank-list">
            {voyages_populaires.map((voyage, indice) => (
              <li key={voyage.id}>
                <span className="rank">{indice + 1}</span>
                <div>
                  <strong>{voyage.titre}</strong>
                  <small>{voyage.destination}</small>
                </div>
                <span className="rank-count">{voyage.nb_reservations} rés.</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Alertes importantes</h2>
          {alertes.length === 0 && <p className="muted">Aucune alerte pour le moment.</p>}
          {alertes.map((a, indice) => (
            <p key={indice} className={`alert-line alert-line-${a.type}`}>{a.message}</p>
          ))}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Réservations récentes</h2>
          <Link to="/admin/reservations" className="btn btn-outline btn-sm">Tout voir</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Client</th><th>Voyage</th><th>Date</th><th>Personnes</th><th>Total</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {pagination.items.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.client_nom}</td>
                  <td>{reservation.voyage_titre}</td>
                  <td>{formatDate(reservation.date_reservation)}</td>
                  <td>{reservation.nombre_personnes}</td>
                  <td>{formatPrix(reservation.prix_total)}</td>
                  <td><Badge info={STATUTS_RESERVATION[reservation.statut]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} count={reservations_recentes.length} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
      </section>
    </div>
  );
}
