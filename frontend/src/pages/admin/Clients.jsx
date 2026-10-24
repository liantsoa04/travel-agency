import { useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../../services/api";
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

const VIDE = { nom: "", prenom: "", email: "", telephone: "", adresse: "" };


function ClientForm({ client, onSaved: apresEnregistrement, onCancel: annulerAction }) {
  const [formulaire, setForm] = useState(client ? { ...VIDE, ...client } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [chargement, definirChargement] = useState(false);

  const change = (evenement) => setForm({ ...formulaire, [evenement.target.name]: evenement.target.value });

  async function submit(evenement) {
    evenement.preventDefault();
    const erreursValidees = {};
    if (!formulaire.nom.trim()) erreursValidees.nom = "Le nom est obligatoire.";
    if (!formulaire.prenom.trim()) erreursValidees.prenom = "Le prénom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(formulaire.email)) erreursValidees.email = "Adresse e-mail invalide.";
    setErreurs(erreursValidees);
    if (Object.keys(erreursValidees).length) return;

    definirChargement(true);
    setErreurGlobale("");
    const donnees = { nom: formulaire.nom, prenom: formulaire.prenom, email: formulaire.email, telephone: formulaire.telephone, adresse: formulaire.adresse };
    try {
      if (client) await api.put(`/clients/${client.id}/`, donnees);
      else await api.post("/clients/", donnees);
      apresEnregistrement();
    } catch (erreurCapture) {
      setErreurs(getFieldErrors(erreurCapture));
      setErreurGlobale(getErrorMessage(erreurCapture));
    } finally {
      definirChargement(false);
    }
  }

  const champ = (nomChamp, libelle, type = "text") => (
    <div className="form-group">
      <label htmlFor={nomChamp}>{libelle}</label>
      <input id={nomChamp} name={nomChamp} type={type} value={formulaire[nomChamp]} onChange={change} />
      {erreurs[nomChamp] && <p className="field-error">{erreurs[nomChamp]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <Alert type="error">{erreurGlobale}</Alert>
      <div className="form-grid">
        {champ("prenom", "Prénom")}
        {champ("nom", "Nom")}
        {champ("email", "Adresse e-mail", "email")}
        {champ("telephone", "Téléphone")}
      </div>
      {champ("adresse", "Adresse")}
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={annulerAction}>Annuler</button>
        <button className="btn btn-primary" disabled={chargement}>{chargement ? "Enregistrement..." : "Enregistrer"}</button>
      </div>
    </form>
  );
}


function ClientReservations({ client }) {
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch(`/clients/${client.id}/reservations/`);
  const pagination = usePagination(donnees ?? []);
  if (chargement) return <Loader />;
  if (erreurApi) return <ErrorState message={erreurApi} onRetry={recharger} />;
  if (donnees.length === 0) return <EmptyState text="Ce client n'a pas encore de réservation." />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Voyage</th><th>Date</th><th>Pers.</th><th>Total</th><th>Statut</th></tr></thead>
        <tbody>
          {pagination.items.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.voyage_titre}</td>
              <td>{formatDate(reservation.date_reservation)}</td>
              <td>{reservation.nombre_personnes}</td>
              <td>{formatPrix(reservation.prix_total)}</td>
              <td><Badge info={STATUTS_RESERVATION[reservation.statut]} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination {...pagination} count={donnees.length} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}

export default function AdminClients() {
  const [search, definirRecherche] = useState("");
  const recherche = useDebounce(search);
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/clients/", { search: recherche });
  const pagination = usePagination(donnees ?? [], recherche);

  const [formClient, setFormClient] = useState(undefined);
  const [voirReservations, setVoirReservations] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [suppression, setSuppression] = useState(false);

  function apresEnregistrement() {
    setMessage(formClient ? "Client modifié avec succès." : "Client ajouté avec succès.");
    setFormClient(undefined);
    recharger();
  }

  async function supprimer() {
    setSuppression(true);
    try {
      await api.delete(`/clients/${aSupprimer.id}/`);
      setMessage("Client supprimé.");
      setASupprimer(null);
      recharger();
    } catch (evenement) {
      setErreurAction(getErrorMessage(evenement));
      setASupprimer(null);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar value={search} onChange={definirRecherche} placeholder="Nom, e-mail, téléphone..." />
        <button className="btn btn-primary" onClick={() => setFormClient(null)}>+ Ajouter un client</button>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
          donnees.length === 0 ? <EmptyState text="Aucun client trouvé." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Client</th><th>Contact</th><th>Adresse</th><th>Réservations</th><th>Actions</th></tr></thead>
                <tbody>
                  {pagination.items.map((categorie) => (
                    <tr key={categorie.id}>
                      <td><strong>{categorie.prenom} {categorie.nom}</strong></td>
                      <td>{categorie.email}<small>{categorie.telephone}</small></td>
                      <td>{categorie.adresse}</td>
                      <td>{categorie.nombre_reservations}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setVoirReservations(categorie)}>Réservations</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setFormClient(categorie)}>Modifier</button>
                          <button className="btn btn-danger-outline btn-sm" onClick={() => setASupprimer(categorie)}>Supprimer</button>
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

      {formClient !== undefined && (
        <Modal title={formClient ? "Modifier le client" : "Ajouter un client"} onClose={() => setFormClient(undefined)}>
          <ClientForm client={formClient} onSaved={apresEnregistrement} onCancel={() => setFormClient(undefined)} />
        </Modal>
      )}

      {voirReservations && (
        <Modal title={`Réservations de ${voirReservations.prenom} ${voirReservations.nom}`} onClose={() => setVoirReservations(null)} wide>
          <ClientReservations client={voirReservations} />
        </Modal>
      )}

      {aSupprimer && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer ce client ? (${aSupprimer.prenom} ${aSupprimer.nom}) Ses réservations seront aussi supprimées.`}
          confirmLabel="Supprimer"
          loading={suppression}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </div>
  );
}
