import Modal from "./Modal";

// Demande une confirmation avant une action importante (ex : suppression)
export default function ConfirmModal({ message, confirmLabel = "Confirmer", onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirmation" onClose={onCancel}>
      <p className="confirm-text">{message}</p>
      <div className="form-actions">
        <button className="btn btn-outline" onClick={onCancel}>Retour</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Patientez..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
