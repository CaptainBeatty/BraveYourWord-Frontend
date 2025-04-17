// NewStoryForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';

function NewStoryForm({ onClose, onStoryCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // facultatif
  const [genre, setGenre] = useState('roman'); // roman par défaut
  const [recueilName, setRecueilName] = useState('');
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const navigate = useNavigate();

  // Quand genre = "nouvelle", on pré-remplit recueilName avec le titre de la nouvelle
  useEffect(() => {
    if (genre === 'nouvelle') {
      setRecueilName((prev) => prev || title);
    }
  }, [title, genre]);

  const handlePublish = async (event) => {
    event.preventDefault();
    setIsPublishing(true);
    setError('');

    try {
      if (genre === 'roman') {
        // Créer un roman
        const response = await api.post('/stories', {
          title,
          description,
          genre: 'roman',
        });
        const createdStory = response.data;

        // Ajoute la card pour le roman dans Main
        if (onStoryCreated) {
          onStoryCreated(createdStory);
        }
      } else if (genre === 'nouvelle') {
        // 1) Créer un recueil (title = recueilName, genre="recueil")
        const recueilResponse = await api.post('/stories', {
          title: recueilName,
          description: '',  // éventuellement, un résumé pour le recueil
          genre: 'recueil'
        });
        const createdRecueil = recueilResponse.data;

        // 2) Créer la nouvelle associée
        const nouvelleResponse = await api.post('/stories', {
          title,
          description,
          genre: 'nouvelle',
          recueil: createdRecueil._id
        });
        const createdNouvelle = nouvelleResponse.data;

        // Ajoute la card pour la nouvelle dans Main
        if (onStoryCreated) {
          onStoryCreated(createdNouvelle);
        }
      }

      // Réinitialise le formulaire
      setTitle('');
      setDescription('');
      setGenre('roman');
      setRecueilName('');

      // Fermer la modale si onClose
      if (onClose) {
        onClose();
      }
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
      <div style={styles.modal}>
        <h2>Nouvelle Histoire</h2>
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
            <label htmlFor="description">Description (facultatif)</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="genre">Type d’œuvre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
              style={styles.input}
            >
              <option value="roman">Roman</option>
              <option value="nouvelle">Nouvelle</option>
            </select>
          </div>

          {/* Champ recueilName, visible uniquement si genre="nouvelle" */}
          {genre === 'nouvelle' && (
            <div style={styles.field}>
              <label htmlFor="recueilName">
                Nom du recueil (par défaut = titre de la nouvelle)
              </label>
              <input
                id="recueilName"
                type="text"
                value={recueilName}
                onChange={(e) => setRecueilName(e.target.value)}
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

export default NewStoryForm;
