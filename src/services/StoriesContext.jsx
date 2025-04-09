// StoriesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/axios'; // Adapté à votre chemin

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);

  // Récupération initiale des histoires
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('/stories');
        setStories(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des histoires", error);
      }
    };
    fetchStories();
  }, []);

  // Ajout d'une nouvelle histoire
  const addStory = (newStory) => {
    setStories(prevStories => [newStory, ...prevStories]);
  };

  // Mise à jour d'une histoire existante
  const updateStory = (updatedStory) => {
    setStories(prevStories =>
      prevStories.map((story) =>
        story._id === updatedStory._id ? updatedStory : story
      )
    );
  };

  // Suppression d'une histoire
  const deleteStory = (id) => {
    setStories(prevStories => prevStories.filter(story => story._id !== id));
  };

  return (
    <StoriesContext.Provider value={{ stories, addStory, updateStory, deleteStory }}>
      {children}
    </StoriesContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useStories = () => useContext(StoriesContext);
