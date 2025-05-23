// NewStoryForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/axios';

function NewStoryForm({
  onClose,
  onStoryCreated,
  existingRecueilId = null,
  initialDescription = '',
  initialGenre = 'roman',
  initialRecueilName = ''
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [genre, setGenre] = useState(initialGenre);
  const [recueilName, setRecueilName] = useState(initialRecueilName);
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  

  // Pré-remplir recueilName au titre du recueil si mode ajout à recueil existant
  useEffect(() => {
    if (existingRecueilId) {
      setGenre('nouvelle');
      setRecueilName(initialRecueilName);
    } else if (genre === 'nouvelle') {
      setRecueilName(prev => prev || title);
    }
  }, [genre, title, existingRecueilId, initialRecueilName]);

  const handlePublish = async (event) => {
    event.preventDefault();
    setIsPublishing(true);
    setError('');
    try {
      // Cas : ajout d'une nouvelle à un recueil existant
      if (existingRecueilId) {
        const response = await api.post('/stories', {
          title,
          description,
          genre: 'nouvelle',
          recueil: existingRecueilId
        });
        if (onStoryCreated) onStoryCreated(response.data);
      }
      // Cas : création d'un roman
      else if (genre === 'roman') {
        const response = await api.post('/stories', {
          title,
          description,
          genre: 'roman'
        });
        if (onStoryCreated) onStoryCreated(response.data);
      }
      // Cas : création d'un recueil + nouvelle
      else if (genre === 'nouvelle') {
        // 1) créer recueil
        const recueilResp = await api.post('/stories', {
          title: recueilName,
          description: description,
          genre: 'recueil'
        });
        const createdRecueil = recueilResp.data;
        // 2) créer nouvelle
        const nouvelleResp = await api.post('/stories', {
          title,
          description,
          genre: 'nouvelle',
          recueil: createdRecueil._id
        });
        if (onStoryCreated) onStoryCreated(nouvelleResp.data);
      }
      // Reset
      setTitle('');
      setDescription('');
      setGenre('roman');
      setRecueilName('');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Erreur lors de la création.';
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Nouvelle Histoire</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handlePublish} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="description">Description (facultatif)</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Selection de type cachée si on ajoute à recueil existant */}
          {!existingRecueilId && (
            <div style={styles.field}>
              <label htmlFor="genre">Type d’œuvre</label>
              <select
                id="genre"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                required
                style={styles.input}
              >
                <option value="roman">Roman</option>
                <option value="nouvelle">Nouvelle</option>
              </select>
            </div>
          )}

          {/* Nom du recueil pour nouvelles */}
          {(!existingRecueilId && genre === 'nouvelle') && (
            <div style={styles.field}>
              <label htmlFor="recueilName">Nom du recueil</label>
              <input
                id="recueilName"
                type="text"
                value={recueilName}
                onChange={e => setRecueilName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

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
              {isPublishing ? 'Création...' : 'Créer'}
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
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '4px',
    minWidth: '300px',
    position: 'relative'
  },
  error: { color: 'red', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column' },
  field: { marginBottom: '1rem' },
  input: { width: '100%', padding: '0.5rem' },
  textarea: { width: '100%', padding: '0.5rem' },
  buttons: { display: 'flex', justifyContent: 'flex-end', gap: '1rem' },
  cancelButton: { backgroundColor: '#ccc', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' },
  publishButton: { backgroundColor: 'green', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }
};

export default NewStoryForm;
