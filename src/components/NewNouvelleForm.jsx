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
      const { data } = await api.post('/stories', {
        title,
        content,
        recueil: recueilId,
        genre: 'nouvelle',
      });
      onNouvelleCreated(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form onSubmit={handlePublish}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        Titre
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Contenu
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </label>
      <div style={{ marginTop: '1rem' }}>
        <button type="button" onClick={onClose} style={styles.cancelButton}>
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPublishing}
          style={styles.publishButton}
        >
          {isPublishing ? 'Publication…' : 'Publier'}
        </button>
      </div>
    </form>
  );
}

const styles = {
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
