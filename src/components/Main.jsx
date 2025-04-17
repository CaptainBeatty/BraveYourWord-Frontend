// Main.jsx
import React from 'react';
import StoryCard from './StoryCard';
import "./Main.css";
import { useStories } from '../services/StoriesContext';

function Main() {
  const { stories } = useStories();
  const filteredStories = stories.filter(story => 
    story.genre === 'roman' || story.genre === 'recueil'
  );

  return (
    <main className="main-container">
      <h2>Bienvenue sur DarkFeather</h2>
      {filteredStories.length > 0 ? (
  filteredStories.map((story) => (
    <StoryCard key={story._id} story={story} />
  ))
) : (
  <p>Aucune histoire pour l'instant.</p>
)}
    </main>
  );
}

export default Main;
