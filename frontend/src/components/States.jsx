import Icon from "./Icon";


export function Loader({ texte = "Chargement..." }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>{texte}</p>
    </div>
  );
}

export function EmptyState({ texte = "Aucun résultat trouvé.", children: contenu }) {
  return (
    <div className="state-box">
      <div className="state-icon"><Icon name="boussole" size={26} /></div>
      <p>{texte}</p>
      {contenu}
    </div>
  );
}

export function ErrorState({ message, onRetry: reessayer }) {
  return (
    <div className="state-box state-error">
      <div className="state-icon"><Icon name="alerte" size={26} /></div>
      <p><strong>Une erreur est survenue.</strong></p>
      <p>{message || "Veuillez réessayer."}</p>
      {reessayer && <button className="btn btn-outline" onClick={reessayer}>Réessayer</button>}
    </div>
  );
}
