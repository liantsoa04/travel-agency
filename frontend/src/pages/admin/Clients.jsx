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

// Formulaire client (ajout / modification)
function ClientForm({ client, onSaved, onCancel }) {
  const [form, setForm] = useState(client ? { ...VIDE, ...client } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const e1 = {};
    if (!form.nom.trim()) e1.nom = "Le nom est obligatoire.";
    if (!form.prenom.trim()) e1.prenom = "Le prénom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e1.email = "Adresse e-mail invalide.";
    setErreurs(e1);
    if (Object.keys(e1).length) return;

    setLoading(true);
    setErreurGlobale("");
    const donnees = { nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone, adresse: form.adresse };
    try {
      if (client) await api.put(`/clients/${client.id}/`, donnees);
      else await api.post("/clients/", donnees);
      onSaved();
    } catch (err) {
      setErreurs(getFieldErrors(err));
      setErreurGlobale(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const champ = (name, label, type = "text") => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} />
      {erreurs[name] && <p className="field-error">{erreurs[name]}</p>}
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
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
      </div>
    </form>
  );
}

// Liste des réservations d'un client
function ClientReservations({ client }) {
  const { data, loading, error, reload } = useFetch(`/clients/${client.id}/reservations/`);
  const pagination = usePagination(data ?? []);
  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (data.length === 0) return <EmptyState text="Ce client n'a pas encore de réservation." />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Voyage</th><th>Date</th><th>Pers.</th><th>Total</th><th>Statut</th></tr></thead>
        <tbody>
          {pagination.items.map((r) => (
            <tr key={r.id}>
              <td>{r.voyage_titre}</td>
              <td>{formatDate(r.date_reservation)}</td>
              <td>{r.nombre_personnes}</td>
              <td>{formatPrix(r.prix_total)}</td>
              <td><Badge info={STATUTS_RESERVATION[r.statut]} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination {...pagination} count={data.length} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const recherche = useDebounce(search);
  const { data, loading, error, reload } = useFetch("/clients/", { search: recherche });
  const pagination = usePagination(data ?? [], recherche);

  const [formClient, setFormClient] = useState(undefined);
  const [voirReservations, setVoirReservations] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [suppression, setSuppression] = useState(false);

  function apresEnregistrement() {
    setMessage(formClient ? "Client modifié avec succès." : "Client ajouté avec succès.");
    setFormClient(undefined);
    reload();
  }

  async function supprimer() {
    setSuppression(true);
    try {
      await api.delete(`/clients/${aSupprimer.id}/`);
      setMessage("Client supprimé.");
      setASupprimer(null);
      reload();
    } catch (e) {
      setErreurAction(getErrorMessage(e));
      setASupprimer(null);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Nom, e-mail, téléphone..." />
        <button className="btn btn-primary" onClick={() => setFormClient(null)}>+ Ajouter un client</button>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState text="Aucun client trouvé." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Client</th><th>Contact</th><th>Adresse</th><th>Réservations</th><th>Actions</th></tr></thead>
                <tbody>
                  {pagination.items.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.prenom} {c.nom}</strong></td>
                      <td>{c.email}<small>{c.telephone}</small></td>
                      <td>{c.adresse}</td>
                      <td>{c.nombre_reservations}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setVoirReservations(c)}>Réservations</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setFormClient(c)}>Modifier</button>
                          <button className="btn btn-danger-outline btn-sm" onClick={() => setASupprimer(c)}>Supprimer</button>
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
