// RecueilPage.jsx — ajout bouton “Ajouter une nouvelle” pour recueil existant
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import StoryCard from './StoryCard';
import Modal from './Modal';
import NewStoryForm from './NewStoryForm';
import { useAuth } from '../services/AuthContext';
import { useStories } from '../services/StoriesContext';

function RecueilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateStory, deleteStory, addStory } = useStories();

  const [recueil, setRecueil]     = useState(null);
  const [nouvelles, setNouvelles] = useState([]);
  const [editMode, setEditMode]   = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc,  setNewDesc]    = useState('');
  const [newDate,  setNewDate]    = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

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

  useEffect(() => {
    if (recueil) {
      setNewTitle(recueil.title);
      setNewDesc(recueil.description || '');
      setNewDate(
        recueil.publicationDate 
          ? new Date(recueil.publicationDate).toISOString().split('T')[0]
          : ''
      );
    }
  }, [recueil]);

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
    if (!window.confirm(
      'Supprimer le recueil ? Toutes les nouvelles associées seront aussi supprimées.'
    )) return;
    // suppression des nouvelles
    await axios.delete(`/stories?recueil=${id}`);
    // suppression du recueil
    await axios.delete(`/stories/${id}`);
    deleteStory(id);
    navigate('/');
  };

  const handleNouvelleCreated = (nouvelle) => {
    // mise à jour locale et globale
    setNouvelles(prev => [...prev, nouvelle]);
    addStory(nouvelle);
    setShowNewModal(false);
  };

  if (!recueil) return <p>Chargement…</p>;
  const isAuthor = user && recueil.author && user.username === recueil.author.username;
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
          <button style={styles.btn} onClick={() => setShowNewModal(true)}>Ajouter une nouvelle</button>
        </div>
      )}

      {editMode && (
        <div style={styles.editBox}>
          <input 
            style={styles.input} 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            placeholder="Titre du recueil" />
          <textarea 
            style={styles.textarea} 
            value={newDesc} 
            onChange={e => setNewDesc(e.target.value)} 
            placeholder="Description" />
          <input 
            type="date" 
            style={styles.input} 
            value={newDate} 
            onChange={e => setNewDate(e.target.value)} />
          <div style={styles.btnRow}>
            <button style={styles.btn} onClick={saveInfo}>Sauvegarder</button>
            <button style={styles.btn} onClick={() => setEditMode(false)}>Annuler</button>
          </div>
        </div>
      )}

      <h3>Nouvelles</h3>
      {nouvelles.length ? (
        nouvelles.map(n => <StoryCard key={n._id} story={n} />)
      ) : <p>Aucune nouvelle.</p>}

      {/* Modal pour créer une nouvelle liée au recueil */}
      {showNewModal && (
        <Modal isOpen onClose={() => setShowNewModal(false)}>
          <NewStoryForm
            existingRecueilId={id}
            initialGenre="nouvelle"
            initialRecueilName={recueil.title}
            initialDescription=""
            onStoryCreated={handleNouvelleCreated}
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
