// RecueilPage.jsx — version éditable & suppressible (correctif isAuthor)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import StoryCard from './StoryCard';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function RecueilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateStory, deleteStory } = useStories();

  const [recueil, setRecueil]     = useState(null);
  const [nouvelles, setNouvelles] = useState([]);
  const [editMode, setEditMode]   = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc,  setNewDesc]    = useState('');
  const [newDate,  setNewDate]    = useState('');

  /* ————————————————— Chargements initiaux ————————————————— */
  useEffect(() => {
    const fetchRecueil = async () => {
      const { data } = await axios.get(`/stories/${id}`);
      setRecueil(data);
    };
    const fetchNouvelles = async () => {
      const { data } = await axios.get('/stories');
      const list = data.filter(s => s.genre === 'nouvelle' && String(s.recueil) === String(id));
      setNouvelles(list);
    };
    fetchRecueil();
    fetchNouvelles();
  }, [id]);

  /* ————————————————— Pré‑remplissage des champs ————————————————— */
  useEffect(() => {
    if (recueil) {
      setNewTitle(recueil.title);
      setNewDesc(recueil.description || '');
      setNewDate(
        recueil.publicationDate ? new Date(recueil.publicationDate).toISOString().split('T')[0] : ''
      );
    }
  }, [recueil]);

  /* ————————————————— Handlers ————————————————— */
  const saveInfo = async () => {
    const { data } = await axios.put(`/stories/${id}`, {
      title: newTitle,
      description: newDesc,
      publicationDate: newDate,
    });
    setRecueil(data);
    updateStory(data);
    setEditMode(false);
  };

  const confirmAndDelete = async () => {
    const ok = window.confirm('Supprimer le recueil ?\nToutes les nouvelles associées seront aussi supprimées.');
    if (!ok) return;
    // supprimer les nouvelles associées
    await axios.delete(`/stories?recueil=${id}`);
    // supprimer le recueil
    await axios.delete(`/stories/${id}`);
    deleteStory(id);
    navigate('/');
  };

  if (!recueil) return <p>Chargement...</p>;

  /* ————————————————— Détermination auteur ————————————————— */
  const sameUsername = user && recueil.author && user.username === recueil.author.username;
  const sameId       = user && recueil.author && (user._id === recueil.author._id || user.id === recueil.author._id);
  const isAuthor     = sameUsername || sameId;

  const fmtDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');

  return (
    <div style={styles.container}>
      <h2>{recueil.title}</h2>
      <p>Par {recueil.author.username}</p>
      <p>Publié le {fmtDate(recueil.publicationDate)}</p>
      {recueil.description && <p>{recueil.description}</p>}

      {isAuthor && (
        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={() => setEditMode(true)}>Modifier</button>
          <button style={styles.btn} onClick={confirmAndDelete}>Supprimer</button>
        </div>
      )}

      {/* ——— Formulaire d'édition ——— */}
      {editMode && (
        <div style={styles.editBox}>
          <input style={styles.input} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <textarea style={styles.textarea} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <input type="date" style={styles.input} value={newDate} onChange={e => setNewDate(e.target.value)} />
          <div style={styles.btnRow}>
            <button style={styles.btn} onClick={saveInfo}>Sauver</button>
            <button style={styles.btn} onClick={() => setEditMode(false)}>Annuler</button>
          </div>
        </div>
      )}

      <h3>Nouvelles</h3>
      {nouvelles.length ? nouvelles.map(n => <StoryCard key={n._id} story={n} />) : <p>Aucune nouvelle.</p>}
    </div>
  );
}

const styles = {
  container: { padding: '1rem', maxWidth: 800, margin: '2rem auto' },
  btnRow:    { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  btn:       { padding: '.5rem 1rem', cursor: 'pointer' },
  editBox:   { border: '1px solid #ccc', borderRadius: 4, padding: '1rem', marginBottom: '1rem' },
  input:     { width: '100%', padding: '.5rem', marginBottom: '.5rem' },
  textarea:  { width: '100%', padding: '.5rem', minHeight: 80, marginBottom: '.5rem' }
};

export default RecueilPage;
