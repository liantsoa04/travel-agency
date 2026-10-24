import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/Badge";
import Icon from "../../components/Icon";
import { ROLES } from "../../utils/format";

export default function Parametres() {
  const { user: utilisateur } = useAuth();

  return (
    <div className="grid-2">
      <section className="panel">
        <h2>Mon compte</h2>
        <dl className="detail-list">
          <div><dt>Nom</dt><dd>{utilisateur.first_name} {utilisateur.last_name}</dd></div>
          <div><dt>E-mail</dt><dd>{utilisateur.email}</dd></div>
          <div><dt>Rôle</dt><dd><Badge info={ROLES[utilisateur.role]} /></dd></div>
        </dl>
        <p className="muted small">
          Pour changer un mot de passe, l'administrateur peut modifier l'utilisateur dans la page « Utilisateurs ».
        </p>
      </section>

      <section className="panel">
        <h2>Droits selon le rôle</h2>
        <table className="table">
          <thead><tr><th>Action</th><th>Admin</th><th>Employé</th><th>Client</th></tr></thead>
          <tbody>
            <tr><td>Dashboard et statistiques</td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td><td><span className="droit-non"><Icon name="fermer" size={16} /></span></td></tr>
            <tr><td>Gérer voyages, clients, réservations</td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td><td><span className="droit-non"><Icon name="fermer" size={16} /></span></td></tr>
            <tr><td>Gérer les utilisateurs</td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td><td><span className="droit-non"><Icon name="fermer" size={16} /></span></td><td><span className="droit-non"><Icon name="fermer" size={16} /></span></td></tr>
            <tr><td>Réserver un voyage</td><td>—</td><td>—</td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td></tr>
            <tr><td>Voir ses réservations et son profil</td><td>—</td><td>—</td><td><span className="droit-oui"><Icon name="valide" size={16} /></span></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
