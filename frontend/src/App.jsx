import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Ballot from './pages/Ballot';
import AlreadyVoted from './pages/AlreadyVoted';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/ballot" element={<Ballot />} />
          <Route path="/voted" element={<AlreadyVoted />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;