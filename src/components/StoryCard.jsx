// StoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString(); 
  };

  // Extrait une portion de la description (par exemple, 100 caractères)
  const getExcerpt = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Redirection en fonction du genre : 
  // pour un roman vers /mystory, pour une nouvelle vers /mynouvelle
  const handleClick = () => {
    if (story.genre === 'roman') {
      navigate(`/mystory/${story._id}`);
    } else if (story.genre === 'nouvelle') {
      navigate(`/mynouvelle/${story._id}`);
    } else {
      navigate(`/mystory/${story._id}`);
    }
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <h3>{story.title}</h3>
      <p>Par {story.author?.username || 'Anonyme'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {story.description && (
        <p style={styles.excerpt}>{getExcerpt(story.description)}</p>
      )}
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
  },
  excerpt: {
    color: '#555',
    fontStyle: 'italic',
    marginTop: '0.5rem'
  }
};

export default StoryCard;
