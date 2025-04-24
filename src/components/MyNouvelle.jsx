// src/components/MyNouvelle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';
import Modal from './Modal';
import NewRecueilForm from './NewRecueilForm';
import CommentModal from './CommentModal';

import { vote } from '../services/likeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp as faUpReg,
  faThumbsDown as faDownReg
} from '@fortawesome/free-regular-svg-icons';
import {
  faThumbsUp as faUpSolid,
  faThumbsDown as faDownSolid
} from '@fortawesome/free-solid-svg-icons';

function MyNouvelle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory, deleteStory } = useStories();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [story, setStory] = useState(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [content, setContent] = useState('');
  const [showRecueilSelect, setShowRecueilSelect] = useState(false);
  const [recueils, setRecueils] = useState([]);
  const [selectedRecueil, setSelectedRecueil] = useState('');
  const [showNewRecueilModal, setShowNewRecueilModal] = useState(false);

  // États like/dislike
  const [likes, setLikes]       = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked]       = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    async function fetchNouvelle() {
      try {
        const response = await axios.get(`/stories/${id}`);
        const data = response.data;
        setStory(data);
        // initialisation orig.
        setContent(data.content || '');
        setNewTitle(data.title || '');
        setNewDescription(data.description || '');
        setNewPubDate(
          data.publicationDate
            ? new Date(data.publicationDate).toISOString().split('T')[0]
            : ''
        );
        if (data.recueil) setSelectedRecueil(data.recueil);
        // initialisation like/dislike
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setLiked(data.likedBy?.includes(user?.id));
        setDisliked(data.dislikedBy?.includes(user?.id));
      } catch (err) {
        console.error('Erreur lors de la récupération de la nouvelle', err);
      }
    }
    fetchNouvelle();
  }, [id, user]);

  useEffect(() => {
    axios.get(`/comments/${id}`).then(res => setCommentCount(res.data.length));
  }, [id, showComments]);


  const handleSaveInfo = async () => {
    try {
      await axios.put(`/stories/${id}`, {
        title: newTitle,
        publicationDate: newPubDate,
        description: newDescription
      });
      const res = await axios.get(`/stories/${id}`);
      setStory(res.data);
      updateStory(res.data);
      setIsEditingInfo(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des informations', err);
    }
  };

  const handleSaveContent = async () => {
    try {
      await axios.put(`/stories/${id}`, {
        title: story.title,
        content
      });
      const res = await axios.get(`/stories/${id}`);
      setStory(res.data);
      updateStory(res.data);
      setIsEditingContent(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du contenu', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/stories/${id}`);
      deleteStory(id);
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la suppression de la nouvelle', err);
    }
  };

  const fetchRecueils = async () => {
    try {
      const res = await axios.get('/stories');
      setRecueils(res.data.filter(s => s.genre === 'recueil'));
    } catch (err) {
      console.error('Erreur lors de la récupération des recueils', err);
    }
  };

  const handleAssociateRecueil = async () => {
    try {
      await axios.put(`/stories/${id}`, { recueil: selectedRecueil });
      const res = await axios.get(`/stories/${id}`);
      setStory(res.data);
      updateStory(res.data);
      setShowRecueilSelect(false);
    } catch (err) {
      console.error('Erreur lors de l\'association au recueil', err);
    }
  };

  const handleRecueilCreated = async created => {
    try {
      await axios.put(`/stories/${id}`, { recueil: created._id });
      const res = await axios.get(`/stories/${id}`);
      setStory(res.data);
      updateStory(res.data);
      setShowNewRecueilModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'association au nouveau recueil', err);
    }
  };

  // Handlers Like / Dislike
  const handleLike = async () => {
    if (!user) {
      alert('Connectez-vous pour liker');
      return;
    }
    try {
      const res = await vote('stories', id, 'like');
      setLikes(res.likes);
      setDislikes(res.dislikes);
      setLiked(v => !v);
      setDisliked(false);
    } catch (err) {
      console.error('Erreur lors du like', err);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert('Connectez-vous pour disliker');
      return;
    }
    try {
      const res = await vote('stories', id, 'dislike');
      setLikes(res.likes);
      setDislikes(res.dislikes);
      setDisliked(v => !v);
      setLiked(false);
    } catch (err) {
      console.error('Erreur lors du dislike', err);
    }
  };

  if (!story) return <p>Chargement...</p>;

  const isAuthor = user?.username === story.author?.username;
  const formatDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');

  return (
    <div style={styles.container}>
      <h2>{story.title}</h2>
      <p>Par {story.author?.username || 'Inconnu'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {story.recueil && <p>Associé au recueil : {story.recueil.title}</p>}

      {/* === Like / Dislike === */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={handleLike}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={liked ? faUpSolid : faUpReg} />{' '}
          <span>{likes}</span>
        </button>
        <button
          onClick={handleDislike}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={disliked ? faDownSolid : faDownReg} />{' '}
          <span>{dislikes}</span>
        </button>
      </div>

      <button
  onClick={() => setShowComments(true)}
  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
>
  <FontAwesomeIcon icon="fa-solid fa-comment" /> {commentCount}
</button>


      {isAuthor && (
        <div style={styles.buttonContainer}>
          <button onClick={() => setIsEditingInfo(true)} style={styles.button}>
            Modifier infos
          </button>
          <button onClick={() => setIsEditingContent(true)} style={styles.button}>
            Écriture
          </button>
          <button onClick={handleDelete} style={styles.button}>
            Supprimer
          </button>
          {!story.recueil && (
            <>
              <button
                onClick={() => {
                  setShowRecueilSelect(true);
                  fetchRecueils();
                }}
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
              onChange={e => setNewTitle(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label>Date de publication</label>
            <input
              type="date"
              value={newPubDate}
              onChange={e => setNewPubDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label>Description</label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>
          <div style={styles.formButtons}>
            <button onClick={handleSaveInfo} style={styles.button}>
              Sauvegarder
            </button>
            <button
              onClick={() => setIsEditingInfo(false)}
              style={styles.button}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {isEditingContent && (
        <div style={styles.editForm}>
          <h3>Mode Écriture</h3>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.formButtons}>
            <button onClick={handleSaveContent} style={styles.button}>
              Sauvegarder
            </button>
            <button
              onClick={() => setIsEditingContent(false)}
              style={styles.button}
            >
              Annuler
            </button>
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
            onChange={e => setSelectedRecueil(e.target.value)}
            style={styles.input}
          >
            <option value="">Sélectionnez un recueil</option>
            {recueils.map(r => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
          <div style={styles.formButtons}>
            <button
              onClick={handleAssociateRecueil}
              style={styles.button}
            >
              Associer
            </button>
            <button
              onClick={() => setShowRecueilSelect(false)}
              style={styles.button}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

        <CommentModal
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          photoId={story._id}
          user={user}
        />


      {showNewRecueilModal && (
        <Modal isOpen onClose={() => setShowNewRecueilModal(false)}>
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

export default MyNouvelle;
