// src/components/MyNouvelle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';
import Modal from './Modal';
import NewRecueilForm from './NewRecueilForm';

import { vote } from '../services/likeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp as faUpReg,
  faThumbsDown as faDownReg,
  faComment as faCommentReg
} from '@fortawesome/free-regular-svg-icons';
import {
  faThumbsUp as faUpSolid,
  faThumbsDown as faDownSolid,
  faComment as faCommentSolid
} from '@fortawesome/free-solid-svg-icons';

function MyNouvelle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateStory, deleteStory } = useStories();
  const navigate = useNavigate();

  // Story state
  const [story, setStory] = useState(null);
  const [content, setContent] = useState('');

  // Edit state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Recueil state
  const [showRecueilSelect, setShowRecueilSelect] = useState(false);
  const [recueils, setRecueils] = useState([]);
  const [selectedRecueil, setSelectedRecueil] = useState('');
  const [showNewRecueilModal, setShowNewRecueilModal] = useState(false);

  // Like/Dislike state
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Comments inline state
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch story and comments
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`/stories/${id}`);
        setStory(data);
        setContent(data.content || '');
        setNewTitle(data.title || '');
        setNewDescription(data.description || '');
        setNewPubDate(data.publicationDate ? new Date(data.publicationDate).toISOString().split('T')[0] : '');
        if (data.recueil) setSelectedRecueil(data.recueil);
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setLiked(data.likedBy?.includes(user?.id));
        setDisliked(data.dislikedBy?.includes(user?.id));

        const commentsRes = await axios.get(`/comments/${id}`); // id here is treated as storyId in backend
        setComments(commentsRes.data);
        setCommentCount(commentsRes.data.length);
      } catch (err) {
        console.error('Erreur récupération nouvelle ou commentaires', err);
      }
    }
    fetchData();
  }, [id, user]);

  // Handlers
  const handleLike = async () => {
    if (!user) return alert('Connectez-vous pour liker');
    const res = await vote('stories', id, 'like');
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setLiked(v => !v);
    setDisliked(false);
  };

  const handleDislike = async () => {
    if (!user) return alert('Connectez-vous pour disliker');
    const res = await vote('stories', id, 'dislike');
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setDisliked(v => !v);
    setLiked(false);
  };

  const handleSaveInfo = async () => {
    await axios.put(`/stories/${id}`, { title: newTitle, publicationDate: newPubDate, description: newDescription });
    const { data } = await axios.get(`/stories/${id}`);
    setStory(data);
    updateStory(data);
    setIsEditingInfo(false);
  };

  const handleSaveContent = async () => {
    await axios.put(`/stories/${id}`, { title: story.title, content });
    const { data } = await axios.get(`/stories/${id}`);
    setStory(data);
    updateStory(data);
    setIsEditingContent(false);
  };

  const handleDelete = async () => {
    await axios.delete(`/stories/${id}`);
    deleteStory(id);
    navigate('/');
  };

  const fetchRecueils = async () => {
    const { data } = await axios.get('/stories');
    setRecueils(data.filter(s => s.genre === 'recueil'));
  };

  const handleAssociateRecueil = async () => {
    await axios.put(`/stories/${id}`, { recueil: selectedRecueil });
    const { data } = await axios.get(`/stories/${id}`);
    setStory(data);
    updateStory(data);
    setShowRecueilSelect(false);
  };

  const handleNewRecueil = async created => {
    await axios.put(`/stories/${id}`, { recueil: created._id });
    const { data } = await axios.get(`/stories/${id}`);
    setStory(data);
    updateStory(data);
    setShowNewRecueilModal(false);
  };

  const handleCommentSubmit = async () => {
    if (!user || !newComment.trim()) return;
    const { data: newC } = await axios.post('/comments', { storyId: id, content: newComment });
    const updated = [...comments, newC];
    setComments(updated);
    setCommentCount(updated.length);
    setNewComment('');
  };

  if (!story) return <p>Chargement...</p>;

  const formatDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');
  const isAuthor = user?.username === story.author?.username;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '2rem auto' }}>
      <h2>{story.title}</h2>
      <p>Par {story.author?.username || 'Inconnu'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>
      {story.recueil && <p>Recueil : {story.recueil.title}</p>}

      {/* Like / Dislike / Comments */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={liked ? faUpSolid : faUpReg} /> {likes}
        </button>
        <button onClick={handleDislike} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={disliked ? faDownSolid : faDownReg} /> {dislikes}
        </button>
        <button onClick={() => setShowComments(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={showComments ? faCommentSolid : faCommentReg} /> {commentCount}
        </button>
      </div>

      {/* Author controls */}
      {isAuthor && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => setIsEditingInfo(true)}>Modifier infos</button>
          <button onClick={() => setIsEditingContent(true)}>Écriture</button>
          <button onClick={handleDelete}>Supprimer</button>
          {!story.recueil && <>
            <button onClick={() => { setShowRecueilSelect(true); fetchRecueils(); }}>Associer recueil</button>
            <button onClick={() => setShowNewRecueilModal(true)}>Nouveau recueil</button>
          </>}
        </div>
      )}

      {/* Edit Info Form */}
      {isEditingInfo && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Modifier Informations</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Titre</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Date de publication</label>
            <input type="date" value={newPubDate} onChange={e => setNewPubDate(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Description</label>
            <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} style={{ width: '100%' }} />
          </div>
          <button onClick={handleSaveInfo} style={{ marginRight: '0.5rem' }}>Sauvegarder</button>
          <button onClick={() => setIsEditingInfo(false)}>Annuler</button>
        </div>
      )}

      {/* Edit Content Form */}
      {isEditingContent && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Mode Écriture</h3>
          <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', height: '200px' }} />
          <button onClick={handleSaveContent} style={{ marginRight: '0.5rem' }}>Sauvegarder</button>
          <button onClick={() => setIsEditingContent(false)}>Annuler</button>
        </div>
      )}

      {/* Story Content Display */}
      {!isEditingContent && <div><p>{content || "Aucun contenu."}</p></div>}

      {/* Recueil Select */}
      {showRecueilSelect && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Associer un recueil existant</h3>
          <select value={selectedRecueil} onChange={e => setSelectedRecueil(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }}> 
            <option value="">-- Sélectionnez --</option>
            {recueils.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select>
          <button onClick={handleAssociateRecueil} style={{ marginRight: '0.5rem' }}>Associer</button>
          <button onClick={() => setShowRecueilSelect(false)}>Annuler</button>
        </div>
      )}

      {/* New Recueil Modal */}
      {showNewRecueilModal && (
        <Modal isOpen onClose={() => setShowNewRecueilModal(false)}>
          <NewRecueilForm onRecueilCreated={handleNewRecueil} onClose={() => setShowNewRecueilModal(false)} />
        </Modal>
      )}

      {/* Inline Comments Section */}
      {showComments && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          <h3>Commentaires ({commentCount})</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {comments.map(c => (
              <div key={c._id} style={{ marginBottom: '0.5rem' }}>
                <strong>{c.userId.username}</strong> : {c.content}
              </div>
            ))}
          </div>
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Écrire un commentaire" style={{ width: '100%', marginBottom: '0.5rem' }} />
          <button onClick={handleCommentSubmit}>Envoyer</button>
        </div>
      )}
    </div>
  );
}

export default MyNouvelle;
