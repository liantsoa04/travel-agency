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

function UserForm({ user: utilisateur, onSaved: apresEnregistrement, onCancel: annulerAction }) {
  const [formulaire, setForm] = useState(utilisateur ? { ...VIDE, ...utilisateur, password: "" } : VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [chargement, definirChargement] = useState(false);

  const change = (evenement) => setForm({ ...formulaire, [evenement.target.name]: evenement.target.value });

  async function submit(evenement) {
    evenement.preventDefault();
    const erreursValidees = {};
    if (!formulaire.first_name.trim()) erreursValidees.first_name = "Le prénom est obligatoire.";
    if (!formulaire.last_name.trim()) erreursValidees.last_name = "Le nom est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(formulaire.email)) erreursValidees.email = "Adresse e-mail invalide.";
    if (!utilisateur && formulaire.password.length < 6) erreursValidees.password = "Mot de passe : 6 caractères minimum.";
    setErreurs(erreursValidees);
    if (Object.keys(erreursValidees).length) return;

    definirChargement(true);
    setErreurGlobale("");
    const donnees = { first_name: formulaire.first_name, last_name: formulaire.last_name, email: formulaire.email, role: formulaire.role };
    if (formulaire.password) donnees.password = formulaire.password;
    try {
      if (utilisateur) await api.patch(`/auth/users/${utilisateur.id}/`, donnees);
      else await api.post("/auth/users/", donnees);
      apresEnregistrement();
    } catch (erreurCapture) {
      setErreurs(getFieldErrors(erreurCapture));
      setErreurGlobale(getErrorMessage(erreurCapture));
    } finally {
      definirChargement(false);
    }
  }

  const champ = (nomChamp, libelle, type = "text", aide) => (
    <div className="form-group">
      <label htmlFor={nomChamp}>{libelle}</label>
      <input id={nomChamp} name={nomChamp} type={type} value={formulaire[nomChamp]} onChange={change} />
      {aide && <p className="muted small">{aide}</p>}
      {erreurs[nomChamp] && <p className="field-error">{erreurs[nomChamp]}</p>}
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
          <select id="role" name="role" value={formulaire.role} onChange={change}>
            {Object.entries(ROLES).map(([voyage, reservation]) => <option key={voyage} value={voyage}>{reservation.label}</option>)}
          </select>
        </div>
      </div>
      {champ("password", utilisateur ? "Nouveau mot de passe" : "Mot de passe", "password",
        utilisateur ? "Laissez vide pour conserver le mot de passe actuel." : "")}
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={annulerAction}>Annuler</button>
        <button className="btn btn-primary" disabled={chargement}>{chargement ? "Enregistrement..." : "Enregistrer"}</button>
      </div>
    </form>
  );
}

export default function Users() {
  const { user: moi } = useAuth();
  const [search, definirRecherche] = useState("");
  const [role, setRole] = useState("");
  const recherche = useDebounce(search);
  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/auth/users/", { search: recherche, role });
  const pagination = usePagination(donnees ?? [], JSON.stringify([recherche, role]));

  const [formUser, setFormUser] = useState(undefined);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [suppression, setSuppression] = useState(false);

  function apresEnregistrement() {
    setMessage(formUser ? "Utilisateur modifié avec succès." : "Utilisateur créé avec succès.");
    setFormUser(undefined);
    recharger();
  }

  async function supprimer() {
    setSuppression(true);
    try {
      await api.delete(`/auth/users/${aSupprimer.id}/`);
      setMessage("Utilisateur supprimé.");
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
        <SearchBar value={search} onChange={definirRecherche} placeholder="Nom ou e-mail..." />
        <select value={role} onChange={(evenement) => setRole(evenement.target.value)} aria-label="Rôle">
          <option value="">Tous les rôles</option>
          {Object.entries(ROLES).map(([voyage, reservation]) => <option key={voyage} value={voyage}>{reservation.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setFormUser(null)}>+ Ajouter un utilisateur</button>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
          donnees.length === 0 ? <EmptyState text="Aucun utilisateur trouvé." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Inscrit le</th><th>Actions</th></tr></thead>
                <tbody>
                  {pagination.items.map((utilisateur) => (
                    <tr key={utilisateur.id}>
                      <td><strong>{utilisateur.first_name} {utilisateur.last_name}</strong></td>
                      <td>{utilisateur.email}</td>
                      <td><Badge info={ROLES[utilisateur.role]} /></td>
                      <td>{formatDate(utilisateur.date_joined)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setFormUser(utilisateur)}>Modifier</button>
                          {utilisateur.id !== moi.id && (
                            <button className="btn btn-danger-outline btn-sm" onClick={() => setASupprimer(utilisateur)}>Supprimer</button>
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
