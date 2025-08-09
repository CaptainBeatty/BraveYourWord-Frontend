// src/components/RecueilPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import StoryCard from './StoryCard';
import Modal from './Modal';
import NewNouvelleForm from './NewNouvelleForm';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function RecueilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addStory, updateStory, deleteStory } = useStories();

  const [recueil, setRecueil] = useState(null);
  const [nouvelles, setNouvelles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Charger recueil et nouvelles au montage et à chaque id
  useEffect(() => {
    fetchRecueil();
    fetchNouvelles();
  }, [id]);

  const fetchRecueil = async () => {
    try {
      const { data } = await axios.get(`/stories/${id}`);
      setRecueil(data);
      setNewTitle(data.title);
      setNewDesc(data.description || '');
      setNewDate(
        data.publicationDate
          ? new Date(data.publicationDate).toISOString().split('T')[0]
          : ''
      );
    } catch (err) {
      console.error('Erreur chargement recueil :', err);
    }
  };

  const fetchNouvelles = async () => {
    try {
      const { data } = await axios.get('/stories');
      const list = data.filter(
        s => s.genre === 'nouvelle' && String(s.recueil) === String(id)
      );
      setNouvelles(list);
    } catch (err) {
      console.error('Erreur chargement nouvelles :', err);
    }
  };

  const saveInfo = async () => {
    try {
      await axios.put(`/stories/${id}`, {
        title: newTitle,
        description: newDesc,
        publicationDate: newDate,
      });
      await fetchRecueil();
    } catch (err) {
      console.error('Erreur sauvegarde recueil :', err);
    } finally {
      setEditMode(false);
    }
  };

  const confirmAndDelete = async () => {
    if (!window.confirm(
      'Supprimer le recueil ? Toutes les nouvelles associées seront aussi supprimées.'
    )) return;
    try {
      await axios.delete(`/stories?recueil=${id}`);
      await axios.delete(`/stories/${id}`);
      deleteStory(id);
      navigate('/');
    } catch (err) {
      console.error('Erreur suppression recueil :', err);
    }
  };

  const handleNouvelleCreated = async (created) => {
    try {
      const { data } = await axios.get(`/stories/${created._id}`);
      setNouvelles(prev => [...prev, data]);
      addStory(data);
    } catch (err) {
      console.error('Erreur récupération nouvelle créée :', err);
    } finally {
      setShowNewModal(false);
    }
  };

  const handleNouvelleUpdated = async (updated) => {
    try {
      const { data } = await axios.get(`/stories/${updated._id}`);
      setNouvelles(prev => prev.map(n => n._id === data._id ? data : n));
      updateStory(data);
    } catch (err) {
      console.error('Erreur récupération nouvelle modifiée :', err);
    }
  };

  if (!recueil) return <p>Chargement…</p>;

  const isAuthor = user && recueil.author && user.username === recueil.author.username;
  const fmtDate = d => (d ? new Date(d).toLocaleDateString() : 'Date inconnue');

  return (
    <div style={styles.container}>
      <h2>{recueil.title}</h2>
      <p>Par {recueil.author ? recueil.author.username : 'Anonyme'}</p>
      <p>Publié le {fmtDate(recueil.publicationDate)}</p>
      {recueil.description && <p>{recueil.description}</p>}

      {isAuthor && (
        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={() => setEditMode(true)}>Modifier</button>
          <button style={styles.btn} onClick={confirmAndDelete}>Supprimer</button>
          <button style={styles.btn} onClick={() => setShowNewModal(true)}>Ajouter une nouvelle</button>
        </div>
      )}

      {editMode && (
        <div style={styles.editBox}>
          <input
            style={styles.input}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Titre du recueil"
          />
          <textarea
            style={styles.textarea}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description"
          />
          <input
            type="date"
            style={styles.input}
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <div style={styles.btnRow}>
            <button style={styles.btn} onClick={saveInfo}>Sauvegarder</button>
            <button style={styles.btn} onClick={() => setEditMode(false)}>Annuler</button>
          </div>
        </div>
      )}

      <h3>Nouvelles</h3>
      {nouvelles.length ? (
        nouvelles.map(n => (
          <StoryCard
            key={n._id}
            story={n}
            onUpdate={handleNouvelleUpdated}
            onDelete={deleteStory}
          />
        ))
      ) : (
        <p>Aucune nouvelle.</p>
      )}

      {showNewModal && (
        <Modal isOpen onClose={() => setShowNewModal(false)}>
          <NewNouvelleForm
            recueilId={id}
            onNouvelleCreated={handleNouvelleCreated}
            onClose={() => setShowNewModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '1rem', maxWidth: 800, margin: '2rem auto' },
  btnRow:    { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  btn:       { padding: '.5rem 1rem', cursor: 'pointer' },
  editBox:   { border: '1px solid #ccc', borderRadius: 4, padding: '1rem', marginBottom: '1rem' },
  input:     { width: '100%', padding: '.5rem', marginBottom: '.5rem' },
  textarea:  { width: '100%', padding: '.5rem', minHeight: 100, marginBottom: '.5rem' }
};

export default RecueilPage;
