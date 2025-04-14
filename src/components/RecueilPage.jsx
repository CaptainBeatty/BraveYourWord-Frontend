// RecueilPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/axios';
import StoryCard from './StoryCard'; // On peut réutiliser StoryCard pour afficher les nouvelles
import NewNouvelleForm from './NewNouvelleForm';

function RecueilPage() {
  const { id } = useParams(); // ID du recueil
  const [recueil, setRecueil] = useState(null);
  const [nouvelles, setNouvelles] = useState([]);
  const [showNewNouvelleForm, setShowNewNouvelleForm] = useState(false);

  useEffect(() => {
    // Récupération du recueil (créé via le modèle Story et ayant genre "recueil")
    const fetchRecueil = async () => {
      try {
        const response = await axios.get(`/stories/${id}`);
        setRecueil(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération du recueil", err);
      }
    };
    // Récupération des nouvelles associées au recueil
    const fetchNouvelles = async () => {
      try {
        const response = await axios.get(`/nouvelles?recueil=${id}`);
        setNouvelles(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des nouvelles", err);
      }
    };

    fetchRecueil();
    fetchNouvelles();
  }, [id]);

  const handleNouvelleCreated = (nouvelle) => {
    setNouvelles(prev => [nouvelle, ...prev]);
    setShowNewNouvelleForm(false);
  };

  return (
    <div style={styles.container}>
      {recueil ? (
        <>
          <h2>Recueil: {recueil.title}</h2>
          <p>{recueil.content}</p>
          <button onClick={() => setShowNewNouvelleForm(true)}>Ajouter une nouvelle</button>
          <h3>Nouvelles du recueil</h3>
          {nouvelles && nouvelles.length > 0 ? (
            nouvelles.map(nouvelle => (
              <StoryCard key={nouvelle._id} story={nouvelle} />
            ))
          ) : (
            <p>Aucune nouvelle pour ce recueil.</p>
          )}
          {showNewNouvelleForm && (
            <NewNouvelleForm 
              recueilId={id}
              onNouvelleCreated={handleNouvelleCreated}
              onClose={() => setShowNewNouvelleForm(false)}
            />
          )}
        </>
      ) : (
        <p>Recueil non trouvé.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px'
  }
};

export default RecueilPage;
