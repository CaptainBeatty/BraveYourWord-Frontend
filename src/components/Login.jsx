import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../services/AuthContext';


const Login = ({ onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', formData);
      // On récupère le token et on appelle login() du contexte
      const { token, username } = res.data;
login(token, { username });

      console.log(res.data)
      if (onClose) onClose();
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la connexion:', err.response?.data?.error || err.message);
      alert('Erreur lors de la connexion. Veuillez vérifier vos informations.');
    }
  };


  // Gérer le clic sur l'overlay pour fermer la modal
  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  return (
    <div style={modalStyles.overlay} onClick={handleOverlayClick}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalStyles.closeButton}>
          &times;
        </button>
        <form onSubmit={handleSubmit}>
          <h2 style={modalStyles.title}>Login</h2>
          <div style={modalStyles.field}>
            <label htmlFor="email" style={styles.label}>Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={modalStyles.field}>
            <label htmlFor="password" style={styles.label}>Password :</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={modalStyles.submitButton}>
            Login
          </button>
          <div style={modalStyles.forgotPassword}>
            <Link
              to="/forgot-password"
              style={{ color: '#007bff', textDecoration: 'none' }}
              onClick={onClose}
            >
              Forgotten password ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px 30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    maxWidth: '400px',
    width: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  title: {
    textAlign: 'center',
    marginBottom: '15px',
    fontSize: '20px',
    color: '#333',
  },
  field: {
    marginBottom: '10px',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    width: '100%',
    fontSize: '16px',
    cursor: 'pointer',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: '15px',
  },
};

const styles = {
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '3px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxSizing: 'border-box',
  },
};

export default Login;
