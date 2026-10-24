import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import { Loader, ErrorState } from "../../components/States";
import { ReservationsChart, RevenueChart } from "../../components/Charts";
import { STATUTS_VOYAGE } from "../../utils/format";

export default function Statistiques() {
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/dashboard/stats/");

  if (chargement) return <Loader />;
  if (erreurApi) return <ErrorState message={erreurApi} onRetry={recharger} />;

  const maximumReservations = Math.max(1, ...donnees.voyages_populaires.map((voyage) => voyage.nb_reservations));

  return (
    <div>
      <div className="grid-2">
        <section className="panel">
          <h2>Réservations par mois</h2>
          <p className="muted small">Les réservations annulées ne sont pas comptées.</p>
          <ReservationsChart data={donnees.mensuel} />
        </section>
        <section className="panel">
          <h2>Revenus par mois</h2>
          <p className="muted small">Seules les réservations confirmées sont comptées.</p>
          <RevenueChart data={donnees.mensuel} />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Voyages les plus réservés</h2>
          {donnees.voyages_populaires.map((voyage) => (
            <div key={voyage.id} className="bar-row">
              <div className="bar-label"><strong>{voyage.titre}</strong><span>{voyage.nb_reservations}</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(voyage.nb_reservations / maximumReservations) * 100}%` }} /></div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Occupation : voyages presque complets</h2>
          {donnees.occupation.length === 0 && <p className="muted">Aucun voyage presque complet.</p>}
          {donnees.occupation.map((voyage) => (
            <div key={voyage.id} className="bar-row">
              <div className="bar-label">
                <strong>{voyage.titre}</strong>
                <span><Badge info={STATUTS_VOYAGE[voyage.statut]} /> {voyage.taux}%</span>
              </div>
              <div className="bar-track"><div className="bar-fill bar-orange" style={{ width: `${voyage.taux}%` }} /></div>
              <small className="muted">{voyage.places_disponibles} place(s) restante(s) sur {voyage.nombre_places}</small>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
