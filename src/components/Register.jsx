import React, { useState } from 'react';
import axios from '../services/axios';

const Register = ({ onClose }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.post('/auth/register', formData);
      alert(res.data.message);
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "Ce nom d'utilisateur est déjà pris.") {
        setErrorMessage("Le nom d'utilisateur est déjà utilisé, veuillez en choisir un autre.");
      } else {
        console.error(err.response?.data?.error || err.message);
        setErrorMessage(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gérer le clic sur l'overlay pour fermer la modal
  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  return (
    <div style={modalStyles.overlay} onClick={handleOverlayClick}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalStyles.closeButton}>&times;</button>
        <div style={styles.container}>
          <h2 style={styles.title}>Register</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              style={styles.input}
            />
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Loading...' : "Register"}
            </button>
          </form>
        </div>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px 30px',
    borderRadius: '10px',
    position: 'relative',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '25px',
    cursor: 'pointer',
  },
};

const styles = {
  container: {
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '15px',
  },
};

export default Register;
