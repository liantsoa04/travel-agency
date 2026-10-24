import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import SearchBar from "../../components/SearchBar";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import VoyageForm from "../../components/VoyageForm";
import SmartImage from "../../components/SmartImage";
import { Pagination, usePagination } from "../../components/Pagination";
import Alert from "../../components/Alert";
import { Loader, EmptyState, ErrorState } from "../../components/States";
import { CATEGORIES, STATUTS_VOYAGE, categorieLabel, formatDate, formatPrix } from "../../utils/format";

export default function AdminVoyages() {
  const [search, definirRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [statut, setStatut] = useState("");
  const recherche = useDebounce(search);

  const { data: donnees, loading: chargement, error: erreurApi, reload: recharger } = useFetch("/voyages/", { search: recherche, categorie, statut });
  const pagination = usePagination(donnees ?? [], JSON.stringify([recherche, categorie, statut]));

  const [formVoyage, setFormVoyage] = useState(undefined);
  const [detail, setDetail] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [suppression, setSuppression] = useState(false);

  function apresEnregistrement() {
    setMessage(formVoyage ? "Voyage modifié avec succès." : "Voyage ajouté avec succès.");
    setFormVoyage(undefined);
    recharger();
  }

  async function supprimer() {
    setSuppression(true);
    try {
      await api.delete(`/voyages/${aSupprimer.id}/`);
      setMessage("Voyage supprimé.");
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
        <SearchBar value={search} onChange={definirRecherche} placeholder="Titre, destination, pays, ville..." />
        <select value={categorie} onChange={(evenement) => setCategorie(evenement.target.value)} aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((categorie) => <option key={categorie.value} value={categorie.value}>{categorie.label}</option>)}
        </select>
        <select value={statut} onChange={(evenement) => setStatut(evenement.target.value)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_VOYAGE).map(([voyage, statut]) => <option key={voyage} value={voyage}>{statut.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setFormVoyage(null)}>+ Ajouter un voyage</button>
      </div>

      <Alert type="success" onClose={() => setMessage("")}>{message}</Alert>
      <Alert type="error" onClose={() => setErreurAction("")}>{erreurAction}</Alert>

      <section className="panel">
        {chargement ? <Loader /> : erreurApi ? <ErrorState message={erreurApi} onRetry={recharger} /> :
          donnees.length === 0 ? <EmptyState text="Aucun voyage trouvé." /> : (
            <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Voyage</th><th>Dates</th><th>Prix</th><th>Places</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pagination.items.map((voyage) => (
                    <tr key={voyage.id}>
                      <td>
                        <div className="cell-voyage">
                          <SmartImage src={voyage.image} alt="" className="thumb" />
                          <div>
                            <strong>{voyage.titre}</strong>
                            <small>{voyage.ville}, {voyage.pays} · {categorieLabel(voyage.categorie)}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(voyage.date_depart)}<br /><small>au {formatDate(voyage.date_retour)}</small></td>
                      <td>{formatPrix(voyage.prix)}</td>
                      <td>{voyage.places_disponibles} / {voyage.nombre_places}</td>
                      <td><Badge info={STATUTS_VOYAGE[voyage.statut]} /></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setDetail(voyage)}>Détails</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setFormVoyage(voyage)}>Modifier</button>
                          <button className="btn btn-danger-outline btn-sm" onClick={() => setASupprimer(voyage)}>Supprimer</button>
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

      {formVoyage !== undefined && (
        <Modal title={formVoyage ? "Modifier le voyage" : "Ajouter un voyage"} onClose={() => setFormVoyage(undefined)} wide>
          <VoyageForm voyage={formVoyage} onSaved={apresEnregistrement} onCancel={() => setFormVoyage(undefined)} />
        </Modal>
      )}

      {detail && (
        <Modal title={detail.titre} onClose={() => setDetail(null)} wide>
          <SmartImage src={detail.image} alt={detail.titre} className="detail-img" />
          <dl className="detail-list">
            <div><dt>Destination</dt><dd>{detail.destination} — {detail.ville}, {detail.pays}</dd></div>
            <div><dt>Catégorie</dt><dd>{categorieLabel(detail.categorie)}</dd></div>
            <div><dt>Dates</dt><dd>{formatDate(detail.date_depart)} → {formatDate(detail.date_retour)}</dd></div>
            <div><dt>Prix</dt><dd>{formatPrix(detail.prix)} par personne</dd></div>
            <div><dt>Places</dt><dd>{detail.places_disponibles} disponibles sur {detail.nombre_places}</dd></div>
            <div><dt>Statut</dt><dd><Badge info={STATUTS_VOYAGE[detail.statut]} /></dd></div>
          </dl>
          <p>{detail.description}</p>
        </Modal>
      )}

      {aSupprimer && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer ce voyage ? (${aSupprimer.titre}) Les réservations liées seront aussi supprimées.`}
          confirmLabel="Supprimer"
          loading={suppression}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </div>
  );
}
