// BurgerMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function BurgerMenu({ isLoggedIn, onLogout, setActiveModal }) {
  // État local pour l'ouverture/fermeture du menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Bascule l'état d'ouverture
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Bouton Burger */}
      <button onClick={toggleMenu} style={styles.burgerButton}>
        &#9776; {/* Icône burger */}
      </button>

      {/* Menu déroulant si isMenuOpen est vrai */}
      {isMenuOpen && (
        <nav style={styles.navMenu}>
          {isLoggedIn ? (
            <>
              <button 
                style={styles.linkButton} 
                onClick={() => { 
                  setActiveModal("newStory"); 
                  toggleMenu(); 
                }}
              >
                Nouvelle histoire
              </button>
              <Link to="/settings" style={styles.link} onClick={toggleMenu}>
                Paramètres
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  toggleMenu();
                }}
                style={styles.linkButton}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button 
                style={styles.linkButton} 
                onClick={() => { 
                  setActiveModal("login"); 
                  toggleMenu(); 
                }}
              >
                Se connecter
              </button>
              <button 
                style={styles.linkButton} 
                onClick={() => { 
                  setActiveModal("register"); 
                  toggleMenu(); 
                }}
              >
                Créer un compte
              </button>
            </>
          )}
        </nav>
      )}
    </>
  );
}

// Vous pouvez copier-coller vos styles existants depuis Header.js
const styles = {
  burgerButton: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navMenu: {
    position: 'absolute',
    right: '1rem',
    top: '3.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    padding: '0.5rem 0',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#333',
    padding: '0.5rem 0',
    textAlign: 'left',
    cursor: 'pointer',
  },
};

export default BurgerMenu;
