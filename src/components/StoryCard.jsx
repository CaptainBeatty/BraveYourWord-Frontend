// StoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString(); 
    // ou .toLocaleString() pour inclure l'heure
  }; 

  return (
    <div style={styles.card} onClick={() => navigate(`/mystory/${story._id}`)}>
      <h3>{story.title}</h3>
      <p>Par {story.author?.username || 'Anonyme'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    cursor: 'pointer',
    backgroundColor: '#fff'
  }
};

export default StoryCard;
