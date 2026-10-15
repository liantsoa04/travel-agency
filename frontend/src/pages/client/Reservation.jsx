import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import { Loader, ErrorState } from "../../components/States";
import { formatDate, formatPrix } from "../../utils/format";

export default function Reservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: voyage, loading, error, reload } = useFetch(`/voyages/${id}/`);
  const { data: profil } = useFetch("/clients/me/");

  const [nombre, setNombre] = useState(1);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const total = Number(voyage.prix) * Number(nombre || 0);

  async function submit(e) {
    e.preventDefault();
    setErreur("");

    // Validations
    if (!(Number(nombre) >= 1)) return setErreur("Le nombre de personnes doit être supérieur à 0.");
    if (voyage.places_disponibles === 0) return setErreur("Ce voyage est complet.");
    if (Number(nombre) > voyage.places_disponibles) return setErreur("Nombre de places disponibles insuffisant.");

    setEnvoi(true);
    try {
      await api.post("/reservations/", { voyage: voyage.id, nombre_personnes: Number(nombre) });
      setSucces("Réservation effectuée avec succès. Elle sera confirmée par notre équipe.");
      setTimeout(() => navigate("/mes-reservations"), 1800);
    } catch (err) {
      setErreur(getErrorMessage(err));
      setEnvoi(false);
    }
  }

  return (
    <div className="container page">
      <Link to={`/voyages/${voyage.id}`} className="back-link"><Icon name="retour" size={16} /> Retour au voyage</Link>
      <h1 className="page-title">Réserver : {voyage.titre}</h1>

      <div className="reservation-grid">
        <form className="card-form" onSubmit={submit} noValidate>
          <h2>Vos informations</h2>
          <div className="info-box">
            <p><strong>{user.first_name} {user.last_name}</strong></p>
            <p>{user.email}</p>
            {profil?.telephone && <p>{profil.telephone}</p>}
            <small>Pour modifier ces informations, rendez-vous sur <Link to="/profil">Mon profil</Link>.</small>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre de personnes</label>
            <div className="stepper">
              <button type="button" onClick={() => setNombre(Math.max(1, Number(nombre) - 1))} aria-label="Moins">−</button>
              <input id="nombre" type="number" min="1" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <button type="button" onClick={() => setNombre(Number(nombre) + 1)} aria-label="Plus">+</button>
            </div>
            <p className="muted small">{voyage.places_disponibles} place(s) disponible(s)</p>
          </div>

          <Alert type="error">{erreur}</Alert>
          <Alert type="success">{succes}</Alert>

          <button className="btn btn-primary btn-block btn-lg" disabled={envoi || !!succes}>
            {envoi ? "Envoi..." : "Confirmer la réservation"}
          </button>
        </form>

        <aside className="booking-box">
          <h2>Récapitulatif</h2>
          <p className="voyage-dest"><Icon name="lieu" size={15} /> {voyage.destination}, {voyage.pays}</p>
          <p className="voyage-dates"><Icon name="calendrier" size={15} /> {formatDate(voyage.date_depart)} – {formatDate(voyage.date_retour)}</p>
          <div className="recap">
            <div><span>Prix par personne</span><strong>{formatPrix(voyage.prix)}</strong></div>
            <div><span>Nombre de personnes</span><strong>{nombre || 0}</strong></div>
            <div className="recap-total"><span>Total</span><strong>{formatPrix(total)}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
