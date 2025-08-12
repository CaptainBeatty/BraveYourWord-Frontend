// Main.jsx
import React from 'react';
import StoryCard from './StoryCard';
import "./Main.css";
import { useStories } from '../services/StoriesContext';

function Main() {
  const { stories } = useStories();
  const filteredStories = stories.filter(
    (story) => story.genre === 'roman' || story.genre === 'recueil'
  );

  return (
    <main className="main-container">
      <h2 className="main-title">Bienvenue sur DarkFeather</h2>

      {filteredStories.length > 0 ? (
        <section
          className="cards-container"
          aria-label="Liste des histoires"
          role="list"
        >
          {filteredStories.map((story) => (
            <StoryCard key={story._id} story={story} role="listitem" />
          ))}
        </section>
      ) : (
        <p className="empty-state">Aucune histoire pour l'instant.</p>
      )}
    </main>
  );
}

export default Main;
