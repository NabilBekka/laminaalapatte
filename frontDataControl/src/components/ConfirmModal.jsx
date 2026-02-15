"use client";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button className="btn btn--danger" onClick={onConfirm}>
            Supprimer
          </button>
          <button className="btn btn--secondary" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
