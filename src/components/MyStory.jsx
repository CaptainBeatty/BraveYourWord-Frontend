// MyStory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function MyStory() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory, deleteStory } = useStories();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);

  // Modes d'édition :
  // isEditingInfo pour modifier titre, publicationDate et description
  // isEditingContent pour modifier le contenu complet (le texte entier)
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  // États pour le formulaire d'édition des infos
  const [newTitle, setNewTitle] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // État pour le contenu (mode Ecriture)
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`/stories/${id}`);
        setStory(response.data);
        setContent(response.data.content);
        // Initialiser les champs avec les valeurs existantes
        setNewTitle(response.data.title);
        setNewDescription(response.data.description || '');
        setNewPubDate(
          response.data.publicationDate
            ? new Date(response.data.publicationDate).toISOString().split('T')[0]
            : ''
        );
      } catch (error) {
        console.error("Erreur lors de la récupération de l'histoire", error);
      }
    };

    fetchStory();
  }, [id]);

  // Fonction pour sauvegarder les informations générales (titre, date, description)
  const handleSaveInfo = async () => {
    try {
      await axios.put(`/stories/${id}`, { 
        title: newTitle, 
        publicationDate: newPubDate,
        description: newDescription
      });
      const response = await axios.get(`/stories/${id}`);
      const updatedStory = response.data;
      setStory(updatedStory);
      updateStory(updatedStory);
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations", error);
    }
  };

  // Fonction pour sauvegarder le contenu complet (Ecriture)
  const handleSaveContent = async () => {
    try {
      await axios.put(`/stories/${id}`, { 
        title: story.title, // le titre reste inchangé ici
        content: content 
      });
      const response = await axios.get(`/stories/${id}`);
      const updatedStory = response.data;
      setStory(updatedStory);
      updateStory(updatedStory);
      setIsEditingContent(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du contenu", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/stories/${id}`);
      deleteStory(id);
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'histoire", error);
    }
  };

  if (!story) return <p>Chargement...</p>;

  const isAuthor = user && (user.username === story.author.username);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      <h2>{story.title}</h2>
      <p>Par {story.author.username}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {isAuthor && (
        <div style={styles.buttonContainer}>
          <button onClick={() => setIsEditingInfo(true)} style={styles.button}>
            Modifier infos
          </button>
          <button onClick={() => setIsEditingContent(true)} style={styles.button}>
            Ecriture
          </button>
          <button onClick={handleDelete} style={styles.button}>
            Supprimer
          </button>
        </div>
      )}

      {/* Formulaire pour modifier le titre, la date et la description */}
      {isEditingInfo && (
        <div style={styles.editForm}>
          <h3>Modifier les informations</h3>
          <div style={styles.formField}>
            <label>Titre</label>
            <input 
              type="text" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label>Date de publication</label>
            <input 
              type="date" 
              value={newPubDate} 
              onChange={(e) => setNewPubDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label>Description</label>
            <textarea 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>
          <div style={styles.formButtons}>
            <button onClick={handleSaveInfo} style={styles.button}>Sauvegarder</button>
            <button onClick={() => setIsEditingInfo(false)} style={styles.button}>Annuler</button>
          </div>
        </div>
      )}

      {/* Formulaire pour modifier le contenu complet */}
      {isEditingContent && (
        <div style={styles.editForm}>
          <h3>Mode Ecriture</h3>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.formButtons}>
            <button onClick={handleSaveContent} style={styles.button}>Sauvegarder</button>
            <button onClick={() => setIsEditingContent(false)} style={styles.button}>Annuler</button>
          </div>
        </div>
      )}

      {/* Affichage du contenu quand non en mode Ecriture */}
      {!isEditingContent && (
        <div>
          <p>{story.content || "Aucun contenu pour l'instant."}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    maxWidth: '800px',
    margin: '2rem auto'
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  editForm: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1rem'
  },
  formField: {
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
  formButtons: {
    display: 'flex',
    gap: '1rem'
  }
};

export default MyStory;
