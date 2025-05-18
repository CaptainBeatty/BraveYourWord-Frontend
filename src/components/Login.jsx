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
      const { token, username } = res.data;
      login(token, { username });
      if (onClose) onClose();
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la connexion:', err.response?.data?.error || err.message);
      alert('Erreur lors de la connexion. Veuillez vérifier vos informations.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Login</h2>
      <div style={{ marginBottom: '0.75rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#555' }}>
          Email :
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#555' }}>
          Password :
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Your password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <button
        type="submit"
        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Se connecter
      </button>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/forgot-password" onClick={onClose} style={{ color: '#007bff', textDecoration: 'none' }}>
          Forgotten password ?
        </Link>
      </div>
    </form>
  );
};

export default Login;
