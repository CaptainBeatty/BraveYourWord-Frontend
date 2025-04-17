// MyNouvelle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';
import Modal from './Modal';
import NewRecueilForm from './NewRecueilForm';

function MyNouvelle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory, deleteStory } = useStories();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  
  // États pour les modes d'édition (infos & écriture)
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [content, setContent] = useState('');
  
  // Pour l'association à un recueil existant
  const [showRecueilSelect, setShowRecueilSelect] = useState(false);
  const [recueils, setRecueils] = useState([]);
  const [selectedRecueil, setSelectedRecueil] = useState('');
  
  // Pour la modal de création d’un nouveau recueil
  const [showNewRecueilModal, setShowNewRecueilModal] = useState(false);
  
  useEffect(() => {
    const fetchNouvelle = async () => {
      try {
        const response = await axios.get(`/stories/${id}`);
        setStory(response.data);
        // Initialiser les états seulement si la story est récupérée
        if (response.data) {
          setContent(response.data.content || '');
          setNewTitle(response.data.title || '');
          setNewDescription(response.data.description || '');
          setNewPubDate(
            response.data.publicationDate
              ? new Date(response.data.publicationDate).toISOString().split('T')[0]
              : ''
          );
          if (response.data.recueil) {
            setSelectedRecueil(response.data.recueil);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la nouvelle", error);
      }
    };
    fetchNouvelle();
  }, [id]);
  
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
  
  const handleSaveContent = async () => {
    try {
      await axios.put(`/stories/${id}`, { 
        title: story.title, // Titre inchangé en mode écriture
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
      console.error("Erreur lors de la suppression de la nouvelle", error);
    }
  };
  
  // Récupérer les recueils existants
  const fetchRecueils = async () => {
    try {
      const response = await axios.get('/stories');
      const recueilList = response.data.filter(s => s.genre === 'recueil');
      setRecueils(recueilList);
    } catch (error) {
      console.error("Erreur lors de la récupération des recueils", error);
    }
  };
  
  const handleAssociateRecueil = async () => {
    try {
      await axios.put(`/stories/${id}`, { recueil: selectedRecueil });
      const response = await axios.get(`/stories/${id}`);
      const updatedStory = response.data;
      setStory(updatedStory);
      updateStory(updatedStory);
      setShowRecueilSelect(false);
    } catch (error) {
      console.error("Erreur lors de l'association au recueil", error);
    }
  };
  
  const handleRecueilCreated = async (createdRecueil) => {
    try {
      await axios.put(`/stories/${id}`, { recueil: createdRecueil._id });
      const response = await axios.get(`/stories/${id}`);
      const updatedStory = response.data;
      setStory(updatedStory);
      updateStory(updatedStory);
      setShowNewRecueilModal(false);
    } catch (error) {
      console.error("Erreur lors de l'association au nouveau recueil", error);
    }
  };
  
  // Vérifie que 'story' est défini pour éviter l'erreur de lecture de propriété sur null
  if (!story) return <p>Chargement...</p>;
  
  const isAuthor = user && (user.username === story.author?.username);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div style={styles.container}>
      <h2>{story.title}</h2>
      <p>Par {story.author?.username || 'Inconnu'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {story.recueil && (
  <p>Associé au recueil : {story.recueil.title}</p>
)}

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
          {!story.recueil && (
            <>
              <button
                onClick={() => { setShowRecueilSelect(true); fetchRecueils(); }}
                style={styles.button}
              >
                Associer un recueil existant
              </button>
              <button
                onClick={() => setShowNewRecueilModal(true)}
                style={styles.button}
              >
                Créer un nouveau recueil
              </button>
            </>
          )}
        </div>
      )}
      
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
      
      {!isEditingContent && (
        <div>
          <p>{story.content || "Aucun contenu pour l'instant."}</p>
        </div>
      )}
      
      {showRecueilSelect && (
        <div style={styles.editForm}>
          <h3>Associer à un recueil existant</h3>
          <select 
            value={selectedRecueil} 
            onChange={(e) => setSelectedRecueil(e.target.value)}
            style={styles.input}
          >
            <option value="">Sélectionnez un recueil</option>
            {recueils.map(recueil => (
              <option key={recueil._id} value={recueil._id}>
                {recueil.title}
              </option>
            ))}
          </select>
          <div style={styles.formButtons}>
            <button onClick={handleAssociateRecueil} style={styles.button}>Associer</button>
            <button onClick={() => setShowRecueilSelect(false)} style={styles.button}>Annuler</button>
          </div>
        </div>
      )}
      
      {showNewRecueilModal && (
        <Modal isOpen={true} onClose={() => setShowNewRecueilModal(false)}>
          <NewRecueilForm 
            onRecueilCreated={handleRecueilCreated}
            onClose={() => setShowNewRecueilModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    maxWidth: '800px',
    margin: '2rem auto',
    minHeight: '100vh'
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

export default MyNouvelle;
