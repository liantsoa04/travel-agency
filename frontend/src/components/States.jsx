import Icon from "./Icon";

// Les 3 états d'interface : chargement, liste vide, erreur.
export function Loader({ text = "Chargement..." }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({ text = "Aucun résultat trouvé.", children }) {
  return (
    <div className="state-box">
      <div className="state-icon"><Icon name="boussole" size={26} /></div>
      <p>{text}</p>
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error">
      <div className="state-icon"><Icon name="alerte" size={26} /></div>
      <p><strong>Une erreur est survenue.</strong></p>
      <p>{message || "Veuillez réessayer."}</p>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>Réessayer</button>}
    </div>
  );
}
