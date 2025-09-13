import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HeaderOriginal from './components/layout/HeaderOriginal';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import PersonalPage from './pages/PersonalPage';
import CorporatePage from './pages/CorporatePage';
import InvestorPage from './pages/InvestorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './hdbank-theme.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <HeaderOriginal />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vi" element={<HomePage />} />
              <Route path="/vi/personal/*" element={<PersonalPage />} />
              <Route path="/vi/corporate/*" element={<CorporatePage />} />
              <Route path="/vi/investor/*" element={<InvestorPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
