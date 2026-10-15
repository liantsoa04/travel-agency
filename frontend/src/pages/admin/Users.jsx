import { useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../../components/SearchBar";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { Pagination, usePagination } from "../../components/Pagination";
import Alert from "../../components/Alert";
import { Loader, EmptyState, ErrorState } from "../../components/States";
import { ROLES, formatDate } from "../../utils/format";

const VIDE = { first_name: "", last_name: "", email: "", role: "employe", password: "" };

function UserForm({ utilisateur, onSaved, onCancel }) {
  const [form, setForm] = useState(utilisateur ? { ...VIDE, ...utilisateur, password: "" } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const e1 = {};
    if (!form.first_name.trim()) e1.first_name = "Le prénom est obligatoire.";
    if (!form.last_name.trim()) e1.last_name = "Le nom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e1.email = "Adresse e-mail invalide.";
    if (!utilisateur && form.password.length < 6) e1.password = "Mot de passe : 6 caractères minimum.";
    setErreurs(e1);
    if (Object.keys(e1).length) return;

    setLoading(true);
    setErreurGlobale("");
    const donnees = { first_name: form.first_name, last_name: form.last_name, email: form.email, role: form.role };
    if (form.password) donnees.password = form.password;   // vide en modification = on garde l'ancien
    try {
      if (utilisateur) await api.patch(`/auth/users/${utilisateur.id}/`, donnees);
      else await api.post("/auth/users/", donnees);
      onSaved();
    } catch (err) {
      setErreurs(getFieldErrors(err));
      setErreurGlobale(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const champ = (name, label, type = "text", aide) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} />
      {aide && <p className="muted small">{aide}</p>}
      {erreurs[name] && <p className="field-error">{erreurs[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <Alert type="error">{erreurGlobale}</Alert>
      <div className="form-grid">
        {champ("first_name", "Prénom")}
        {champ("last_name", "Nom")}
        {champ("email", "Adresse e-mail", "email")}
        <div className="form-group">
          <label htmlFor="role">Rôle</label>
          <select id="role" name="role" value={form.role} onChange={change}>
            {Object.entries(ROLES).map(([v, r]) => <option key={v} value={v}>{r.label}</option>)}
          </select>
        </div>
      </div>
      {champ("password", utilisateur ? "Nouveau mot de passe" : "Mot de passe", "password",
        utilisateur ? "Laissez vide pour conserver le mot de passe actuel." : "")}
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
      </div>
    </form>
  );
}

export default function Users() {
  const { user: moi } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const recherche = useDebounce(search);
  const { data, loading, error, reload } = useFetch("/auth/users/", { search: recherche, role });
  const pagination = usePagination(data ?? [], JSON.stringify([recherche, role]));

  const [formUser, setFormUser] = useState(undefined);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [suppression, setSuppression] = useState(false);

  function apresEnregistrement() {
    setMessage(formUser ? "Utilisateur modifié avec succès." : "Utilisateur créé avec succès.");
    setFormUser(undefined);
    reload();
  }

  async function supprimer() {
    setSuppression(true);
    try {
      await api.delete(`/auth/users/${aSupprimer.id}/`);
      setMessage("Utilisateur supprimé.");
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
        <SearchBar value={search} onChange={setSearch} placeholder="Nom ou e-mail..." />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rôle">
          <option value="">Tous les rôles</option>
          {Object.entries(ROLES).map(([v, r]) => <option key={v} value={v}>{r.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setFormUser(null)}>+ Ajouter un utilisateur</button>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState text="Aucun utilisateur trouvé." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Inscrit le</th><th>Actions</th></tr></thead>
                <tbody>
                  {pagination.items.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.first_name} {u.last_name}</strong></td>
                      <td>{u.email}</td>
                      <td><Badge info={ROLES[u.role]} /></td>
                      <td>{formatDate(u.date_joined)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setFormUser(u)}>Modifier</button>
                          {u.id !== moi.id && (
                            <button className="btn btn-danger-outline btn-sm" onClick={() => setASupprimer(u)}>Supprimer</button>
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

      {formUser !== undefined && (
        <Modal title={formUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"} onClose={() => setFormUser(undefined)}>
          <UserForm utilisateur={formUser} onSaved={apresEnregistrement} onCancel={() => setFormUser(undefined)} />
        </Modal>
      )}

      {aSupprimer && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer cet utilisateur ? (${aSupprimer.email})`}
          confirmLabel="Supprimer"
          loading={suppression}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </div>
  );
}
