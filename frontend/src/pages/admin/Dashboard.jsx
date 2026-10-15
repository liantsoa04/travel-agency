import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { Loader, ErrorState } from "../../components/States";
import { ReservationsChart, RevenueChart } from "../../components/Charts";
import { Pagination, usePagination } from "../../components/Pagination";
import { STATUTS_RESERVATION, formatDate, formatPrix } from "../../utils/format";

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch("/dashboard/stats/");
  const pagination = usePagination(data?.reservations_recentes ?? []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { cartes, mensuel, voyages_populaires, reservations_recentes, alertes } = data;

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
            {voyages_populaires.map((v, i) => (
              <li key={v.id}>
                <span className="rank">{i + 1}</span>
                <div>
                  <strong>{v.titre}</strong>
                  <small>{v.destination}</small>
                </div>
                <span className="rank-count">{v.nb_reservations} rés.</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Alertes importantes</h2>
          {alertes.length === 0 && <p className="muted">Aucune alerte pour le moment.</p>}
          {alertes.map((a, i) => (
            <p key={i} className={`alert-line alert-line-${a.type}`}>{a.message}</p>
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
              {pagination.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.client_nom}</td>
                  <td>{r.voyage_titre}</td>
                  <td>{formatDate(r.date_reservation)}</td>
                  <td>{r.nombre_personnes}</td>
                  <td>{formatPrix(r.prix_total)}</td>
                  <td><Badge info={STATUTS_RESERVATION[r.statut]} /></td>
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
