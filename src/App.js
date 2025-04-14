// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from "./components/Main";
import Register from "./components/Register";
import Login from "./components/Login";
import NewStoryForm from "./components/NewStoryForm";
import MyStory from "./components/MyStory";
import RecueilPage from "./components/RecueilPage"; // Nouvelle page
import { AuthProvider } from './services/AuthContext';
import Modal from "./components/Modal";
import { StoriesProvider, useStories } from './services/StoriesContext';
import MyNouvelle from "./components/MyNouvelle";


function AppContent({ activeModal, setActiveModal }) {
  const { addStory } = useStories();

  const handleClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="app-container">
      <Header setActiveModal={setActiveModal} />
      <div className="content">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mystory/:id" element={<MyStory />} />
        <Route path="/recueil/:id" element={<RecueilPage />} />
        <Route path="/mynouvelle/:id" element={<MyNouvelle />} />  {/* Nouvelle route */}

      </Routes>
      <Modal isOpen={activeModal === "login"} onClose={() => setActiveModal(null)}>
        <Login onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal isOpen={activeModal === "register"} onClose={() => setActiveModal(null)}>
        <Register onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal isOpen={activeModal === "newStory"} onClose={handleClose}>
        <NewStoryForm
          onStoryCreated={(createdStory) => {
            console.log("Nouvelle histoire créée :", createdStory);
            addStory(createdStory);
            setActiveModal(null);
          }}
          onClose={handleClose}
        />
      </Modal>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <AuthProvider>
      <StoriesProvider>
        <Router>
          <AppContent activeModal={activeModal} setActiveModal={setActiveModal} />
        </Router>
      </StoriesProvider>
    </AuthProvider>
  );
}

export default App;
