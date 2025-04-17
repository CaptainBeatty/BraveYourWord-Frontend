// NewNouvelleForm.jsx
import React, { useState } from 'react';
import api from '../services/axios';

function NewNouvelleForm({ recueilId, onNouvelleCreated, onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  

  const handlePublish = async (event) => {
    event.preventDefault();
    setIsPublishing(true);
    setError('');

    try {
      const response = await api.post('/nouvelles', { 
        title,
        content,
        recueil: recueilId
      });
      const nouvelle = response.data;
      if (onNouvelleCreated) {
        onNouvelleCreated(nouvelle);
      }
      setTitle('');
      setContent('');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Erreur lors de la publication.';
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Nouvelle</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handlePublish} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="content">Contenu</label>
            <textarea
              id="content"
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={styles.textarea}
            />
          </div>
          <div style={styles.buttons}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelButton}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isPublishing} 
              style={styles.publishButton}
            >
              {isPublishing ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '4px',
    minWidth: '300px',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  publishButton: {
    backgroundColor: 'green',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
};

export default NewNouvelleForm;
