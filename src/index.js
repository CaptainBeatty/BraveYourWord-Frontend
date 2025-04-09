// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ou './App' si vous l’appelez App.js
import './index.css'; // vos styles globaux

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
