// MyStory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function MyStory() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory } = useStories(); // On récupère la méthode updateStory du contexte
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const { deleteStory } = useStories();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`/stories/${id}`);
        setStory(response.data);
        setContent(response.data.content);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'histoire", error);
      }
    };

    fetchStory();
  }, [id]);

  const handleSave = async () => {
    try {
      // On effectue la mise à jour avec PUT
      await axios.put(`/stories/${id}`, { 
        title: story.title, 
        content: content 
      });
      // Puis on refait un GET pour récupérer l'objet complet mis à jour
      const response = await axios.get(`/stories/${id}`);
      const updatedStory = response.data;
      setStory(updatedStory);
      // Mise à jour du contexte global
      updateStory(updatedStory);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'histoire", error);
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

  // Vérifie si l'utilisateur connecté est bien l'auteur de l'histoire.
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
      {isAuthor ? (
        <div>
          {isEditing ? (
            <div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.textarea}
              />
              <button onClick={handleSave} style={styles.button}>Sauvegarder</button>
              <button onClick={() => setIsEditing(false)} style={styles.button}>Annuler</button>
            </div>
          ) : (
            <div>
              <p>{story.content || "Aucun contenu pour l'instant."}</p>
              <button onClick={() => setIsEditing(true)} style={styles.button}>Modifier</button>
              <button onClick={handleDelete} style={styles.button}>Supprimer</button>
            </div>
          )}
        </div>
      ) : (
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
    margin: '2rem auto',
    minHeight:'100vh'
  },
  textarea: {
    width: '100%',
    height: '200px',
    padding: '0.5rem',
    fontSize: '1rem'
  },
  button: {
    marginRight: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer'
  }
};

export default MyStory;
