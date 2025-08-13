// StoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';              // Nouveau fichier CSS pour la BookCard
import bookImage from '../assets/book-icon.png'; // Chemin vers votre icône

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (story.genre === 'roman') {
      navigate(`/mystory/${story._id}`);
    } else if (story.genre === 'recueil') {
      navigate(`/recueil/${story._id}`);
    } else if (story.genre === 'nouvelle') {
      navigate(`/mynouvelle/${story._id}`);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');

  // On peut limiter la longueur de la description (facultatif) :
  const excerpt = (txt) => {
  if (!txt || txt.trim() === '') return ''; // aucun texte → rien
  return txt.length > 100 
    ? txt.slice(0, 100) + '…' 
    : txt + '…';
};

  return (
    <div className="book-card" onClick={handleClick}>
      {/* On affiche l’image du livre en background via CSS, 
          ou alternativement on peut aussi la rendre en <img> : */}
      <img src={bookImage} alt="Couverture du livre" className="book-image" />

      {/* Calque de texte positionné absolument au-dessus de l’image */}
      <div className="book-text">
        <h3 className="book-title">{story.title}</h3>
        <p className="book-author">Par {story.author?.username || 'Anonyme'}</p>
        <p className="book-date">Publiée le {formatDate(story.publicationDate)}</p>
        {story.description && (
          <p className="book-description">{excerpt(story.description)}</p>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
