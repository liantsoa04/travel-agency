import Icon from "./Icon";


export default function Modal({ title: titre, onClose: fermerAction, children: contenu, large = false }) {
  return (
    <div className="modal-overlay" onClick={fermerAction}>
      <div className={`modal ${large ? "modal-wide" : ""}`} onClick={(evenement) => evenement.stopPropagation()}>
        <div className="modal-header">
          <h3>{titre}</h3>
          <button className="modal-close" onClick={fermerAction} aria-label="Fermer">
            <Icon name="fermer" size={18} />
          </button>
        </div>
        <div className="modal-body">{contenu}</div>
      </div>
    </div>
  );
}
