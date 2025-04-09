// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import BurgerMenu from './BurgerMenu';
import { useAuth } from '../services/AuthContext';

function Header({ setActiveModal }) {
  const { isLoggedIn, logout, user } = useAuth();

  
  return (
    <header style={styles.header}>
      {/* Titre "braveYourWord" */}
      <Link to="/" style={styles.title}>
        DarkFeather
      </Link>

      <div style={styles.rightContainer}>
        {isLoggedIn && user && (
          <span style={styles.username}>
            Hello {user.username}
          </span>
        )}
        <BurgerMenu 
          isLoggedIn={isLoggedIn}
          onLogout={logout}
          setActiveModal={setActiveModal}
        />
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    backgroundColor: '#eee',
    position: 'relative',
  },
  title: {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#333',
    fontStyle: 'italic'
  },
  rightContainer: {
    /* Affiche le hello user et le burger sur la même ligne */
    display: 'flex',
    alignItems: 'center',
  },
  username: {
    color: 'black',
    marginRight: '1rem', // Par exemple pour laisser un espace avant le burger
  },
};

export default Header;
