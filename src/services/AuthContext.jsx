import React, { createContext, useState, useEffect, useContext } from 'react';


// On exporte notre contexte
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Au démarrage, vérifier par exemple le token dans le localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    // On relit également la clé "user" si elle existe
    const userFromStorage = localStorage.getItem('user');
    
    if (token) {
      setIsLoggedIn(true);
      if (userFromStorage) {
        // On transforme la chaîne JSON en objet JS
        setUser(JSON.parse(userFromStorage));
      }
    }
  }, []);


  const login = (token, userData) => {
    // Exemple : on stocke le token et on met isLoggedIn à true
    console.log('login() appelé avec :', token, userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    // Suppression du token et mise à jour de l'état
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = { isLoggedIn, login, logout, user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
