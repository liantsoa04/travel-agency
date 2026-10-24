import Modal from "./Modal";


export default function ConfirmModal({ message, confirmLabel = "Confirmer", onConfirm: confirmerAction, onCancel: annulerAction, loading: chargement }) {
  return (
    <Modal title="Confirmation" onClose={annulerAction}>
      <p className="confirm-text">{message}</p>
      <div className="form-actions">
        <button className="btn btn-outline" onClick={annulerAction}>Retour</button>
        <button className="btn btn-danger" onClick={confirmerAction} disabled={chargement}>
          {chargement ? "Patientez..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
