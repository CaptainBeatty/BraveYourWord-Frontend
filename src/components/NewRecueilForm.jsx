// NewRecueilForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';

function NewRecueilForm({ onClose, onRecueilCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(''); // Optionnel : URL de l'image de couverture
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      // On envoie genre: "recueil" pour créer un recueil
      const response = await api.post('/stories', {
        title,
        description,
        coverImage,         // Ajoutez ce champ si votre modèle est adapté
        genre: 'recueil'    // Forcer le genre sur "recueil"
      });
      const createdRecueil = response.data;
      
      // Si vous souhaitez transmettre le recueil créé au composant parent, vous pouvez utiliser onRecueilCreated
      if (onRecueilCreated) {
        onRecueilCreated(createdRecueil);
      }
      
      // Vous pouvez rediriger l'utilisateur vers la page dédiée au recueil
      navigate(`/recueil/${createdRecueil._id}`);
      
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setCoverImage('');
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Erreur lors de la création du recueil.';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Créer un recueil</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="title">Titre du recueil</label>
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Résumé ou présentation du recueil (facultatif)"
              style={styles.textarea}
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="coverImage">Image de couverture (URL, optionnel)</label>
            <input
              id="coverImage"
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              style={styles.input}
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
              disabled={isCreating}
              style={styles.createButton}
            >
              {isCreating ? 'Création en cours...' : 'Créer'}
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
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  modal: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    minWidth: '300px'
  },
  error: {
    color: 'red',
    marginBottom: '1rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  field: {
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem'
  },
  textarea: {
    width: '100%',
    padding: '0.5rem'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  cancelButton: {
    backgroundColor: '#ccc',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer'
  },
  createButton: {
    backgroundColor: 'blue',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer'
  }
};

export default NewRecueilForm;
