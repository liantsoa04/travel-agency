import Icon from "./Icon";

// Message de succès ou d'erreur
export default function Alert({ type = "error", children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Fermer">
          <Icon name="fermer" size={16} />
        </button>
      )}
    </div>
  );
}
