// src/components/MyStory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';
import Modal from './Modal';
import Login from './Login';

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

function MyStory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteStory } = useStories();

  const [story, setStory] = useState(null);
  const [content, setContent] = useState('');

  // edit states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // like/dislike
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // comments inline
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: s } = await axios.get(`/stories/${id}`);
        setStory(s);
        setContent(s.content || '');
        setNewTitle(s.title || '');
        setNewDescription(s.description || '');
        setNewPubDate(
          s.publicationDate
            ? new Date(s.publicationDate).toISOString().split('T')[0]
            : ''
        );
        setLikes(s.likes || 0);
        setDislikes(s.dislikes || 0);
        setLiked(s.likedBy?.includes(user?.id));
        setDisliked(s.dislikedBy?.includes(user?.id));

        const { data: c } = await axios.get(`/comments/${id}`);
        setComments(c);
        setCommentCount(c.length);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/');
          return;
        }
        console.error(err);
      }
    }
    fetchData();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const res = await vote('stories', id, 'like');
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setLiked(v => !v);
    setDisliked(false);
  };

  const handleDislike = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const res = await vote('stories', id, 'dislike');
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setDisliked(v => !v);
    setLiked(false);
  };

  const handleCommentToggle = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowComments(v => !v);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!newComment.trim()) return;
    try {
      const { data: newC } = await axios.post('/comments', { storyId: id, content: newComment });
      setComments(prev => [...prev, newC]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/stories/${id}`);
      deleteStory(id);
      navigate('/');
    } catch (err) {
      console.error('Erreur suppression story:', err);
    }
  };

  if (!story) return <p>Chargement...</p>;

  const formatDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');
  const isAuthor = user?.username === story.author?.username;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '2rem auto' }}>
      <h2>{story.title}</h2>
      <p>Par {story.author?.username || 'Inconnu'}</p>
      <p>Publiée le {formatDate(story.publicationDate)}</p>

      {/* Like / Dislike / Comments */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={liked ? faUpSolid : faUpReg} /> {likes}
        </button>
        <button onClick={handleDislike} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={disliked ? faDownSolid : faDownReg} /> {dislikes}
        </button>
        <button onClick={handleCommentToggle} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={showComments ? faCommentSolid : faCommentReg} /> {commentCount}
        </button>
      </div>

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
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire"
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <button onClick={handleCommentSubmit}>Envoyer</button>
        </div>
      )}

      {/* Login Form Modal */}
      {showLoginModal && (
        <Modal isOpen onClose={() => setShowLoginModal(false)}>
          <Login onClose={() => setShowLoginModal(false)} />
        </Modal>
      )}

      {/* Author Edit Controls */}
      {isAuthor && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => setIsEditingInfo(true)}>Modifier infos</button>
          <button onClick={() => setIsEditingContent(true)}>Écriture</button>
          <button onClick={handleDelete}>Supprimer</button>
        </div>
      )}

      {/* Edit Info Form */}
      {isEditingInfo && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h3>Modifier informations</h3>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
          <input type="date" value={newPubDate} onChange={e => setNewPubDate(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
          <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
          <button onClick={async () => {
            await axios.put(`/stories/${id}`, { title: newTitle, publicationDate: newPubDate, description: newDescription });
            setIsEditingInfo(false);
          }}>Sauvegarder</button>
          <button onClick={() => setIsEditingInfo(false)} style={{ marginLeft: '0.5rem' }}></button>
        </div>
      )}

      {/* Edit Content Form */}
      {isEditingContent && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h3>Mode écriture</h3>
          <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', height: '200px', marginBottom: '0.5rem' }} />
          <button onClick={async () => {
            await axios.put(`/stories/${id}`, { title: story.title, content });
            setIsEditingContent(false);
          }}>Sauvegarder</button>
          <button onClick={() => setIsEditingContent(false)} style={{ marginLeft: '0.5rem' }}></button>
        </div>
      )}

      {/* Story Content Display */}
      {!isEditingContent && (
        <div style={{ marginTop: '2rem' }}><p>{content || "Aucun contenu."}</p></div>
      )}
    </div>
  );
}

export default MyStory;
