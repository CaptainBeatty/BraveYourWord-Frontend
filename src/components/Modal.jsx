// Modal.jsx
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  // Ne pas rendre le composant si la prop isOpen est false
  if (!isOpen) return null;

  // Fermer la modal quand on clique sur l'overlay
  const handleOverlayClick = (e) => {
    // e.target === e.currentTarget => on a cliqué sur l’overlay lui-même
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        {/* Bouton (croix) pour fermer la modal */}
        <button style={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Contenu de la modal passé en children (ex. formulaire Register) */}
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px 30px',
    borderRadius: '10px',
    position: 'relative',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '25px',
    cursor: 'pointer',
  },
};

export default Modal;
