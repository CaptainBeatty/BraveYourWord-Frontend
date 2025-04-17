// StoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (story.genre === 'roman') {
      navigate(`/mystory/${story._id}`);
    } else if (story.genre === 'recueil') {
      navigate(`/recueil/${story._id}`);
    } else if (story.genre === 'nouvelle') {
      navigate(`/mynouvelle/${story._id}`);          // <-- NOUVEAU
    }
  };

  const formatDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');
  const excerpt   = txt => (txt && txt.length > 100 ? txt.slice(0, 100) + '…' : txt || '');

  return (
    <div style={styles.card} onClick={handleClick}>
      <h3>{story.title}</h3>
      <p>Par {story.author?.username || 'Anonyme'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {story.description && <p style={styles.excerpt}>{excerpt(story.description)}</p>}
    </div>
  );
};

const styles = { /* … identique à votre version … */ };

export default StoryCard;
