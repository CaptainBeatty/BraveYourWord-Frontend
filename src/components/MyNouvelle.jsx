// MyNouvelle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function MyNouvelle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory } = useStories();
  const { deleteStory } = useStories();
  const navigate = useNavigate();
  const [nouvelle, setNouvelle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchNouvelle = async () => {
      try {
        const response = await axios.get(`/stories/${id}`);
        setNouvelle(response.data);
        setDescription(response.data.description);
      } catch (error) {
        console.error("Erreur lors de la récupération de la nouvelle", error);
      }
    };

    fetchNouvelle();
  }, [id]);

  const handleSave = async () => {
    try {
      await axios.put(`/stories/${id}`, { 
        title: nouvelle.title, 
        description 
      });
      const response = await axios.get(`/stories/${id}`);
      const updatedNouvelle = response.data;
      setNouvelle(updatedNouvelle);
      updateStory(updatedNouvelle);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la nouvelle", error);
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

  if (!nouvelle) return <p>Chargement...</p>;

  const isAuthor = user && (user.username === nouvelle.author.username);

  return (
    <div style={styles.container}>
      <h2>{nouvelle.title}</h2>
      <p>Par {nouvelle.author.username}</p>
      <p>Publiée le {new Date(nouvelle.publicationDate).toLocaleDateString()}</p>
      {isAuthor ? (
        <div>
          {isEditing ? (
            <div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
              />
              <button onClick={handleSave} style={styles.button}>Sauvegarder</button>
              <button onClick={() => setIsEditing(false)} style={styles.button}>Annuler</button>
            </div>
          ) : (
            <div>
              <p>{nouvelle.description || "Aucune description pour l'instant."}</p>
              <button onClick={() => setIsEditing(true)} style={styles.button}>Modifier</button>
              <button onClick={handleDelete} style={styles.button}>Supprimer</button>
            </div>
          )}
        </div>
      ) : (
        <p>{nouvelle.description || "Aucune description pour l'instant."}</p>
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
  textarea: {
    width: '100%',
    height: '150px',
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

export default MyNouvelle;
