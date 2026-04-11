import React from 'react';

function LogoutConfirmation({ onConfirm, onCancel }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="logout-modal-overlay" onClick={handleOverlayClick}>
      <div className="logout-modal">
        <div className="logout-modal-content">
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out?</p>
          <div className="logout-modal-buttons">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-confirm" onClick={onConfirm}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmation;