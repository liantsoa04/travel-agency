import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import { Loader, ErrorState } from "../../components/States";
import { ReservationsChart, RevenueChart } from "../../components/Charts";
import { STATUTS_VOYAGE } from "../../utils/format";

export default function Statistiques() {
  const { data, loading, error, reload } = useFetch("/dashboard/stats/");

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const maxReservations = Math.max(1, ...data.voyages_populaires.map((v) => v.nb_reservations));

  return (
    <div>
      <div className="grid-2">
        <section className="panel">
          <h2>Réservations par mois</h2>
          <p className="muted small">Les réservations annulées ne sont pas comptées.</p>
          <ReservationsChart data={data.mensuel} />
        </section>
        <section className="panel">
          <h2>Revenus par mois</h2>
          <p className="muted small">Seules les réservations confirmées sont comptées.</p>
          <RevenueChart data={data.mensuel} />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Voyages les plus réservés</h2>
          {data.voyages_populaires.map((v) => (
            <div key={v.id} className="bar-row">
              <div className="bar-label"><strong>{v.titre}</strong><span>{v.nb_reservations}</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(v.nb_reservations / maxReservations) * 100}%` }} /></div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Occupation : voyages presque complets</h2>
          {data.occupation.length === 0 && <p className="muted">Aucun voyage presque complet.</p>}
          {data.occupation.map((v) => (
            <div key={v.id} className="bar-row">
              <div className="bar-label">
                <strong>{v.titre}</strong>
                <span><Badge info={STATUTS_VOYAGE[v.statut]} /> {v.taux}%</span>
              </div>
              <div className="bar-track"><div className="bar-fill bar-orange" style={{ width: `${v.taux}%` }} /></div>
              <small className="muted">{v.places_disponibles} place(s) restante(s) sur {v.nombre_places}</small>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
