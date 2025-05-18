// src/components/CommentModal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import axios from '../services/axios';

function CommentModal({ isOpen, onClose, photoId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      axios.get(`/comments/${photoId}`)
        .then(res => setComments(res.data))
        .catch(err => console.error('Erreur récupération commentaires', err));
    }
  }, [isOpen, photoId]);

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;
    try {
      await axios.post('/comments', {
        photoId,
        content: newComment,
      });
      setNewComment('');
      const res = await axios.get(`/comments/${photoId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Erreur ajout commentaire', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Commentaires</h3>
      {comments.map(c => (
        <div key={c._id} style={{ marginBottom: '0.5rem' }}>
          <strong>{c.userId.username}</strong> : {c.content}
        </div>
      ))}
      <textarea
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        placeholder="Écrire un commentaire"
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '0.5rem' }}>
        Envoyer
      </button>
    </Modal>
  );
}

export default CommentModal;
