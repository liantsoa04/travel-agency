import Icon from "./Icon";


export default function Alert({ type = "error", children: contenu, onClose: fermerAction }) {
  if (!contenu) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{contenu}</span>
      {fermerAction && (
        <button className="alert-close" onClick={fermerAction} aria-label="Fermer">
          <Icon name="fermer" size={16} />
        </button>
      )}
    </div>
  );
}
