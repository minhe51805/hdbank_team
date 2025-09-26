import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import HeaderOriginal from './components/layout/HeaderOriginal';
import Footer from './components/layout/Footer';
import ChatBot from './components/ui/ChatBot';
import PersonalitySelector, { BankingPersonality } from './components/ui/PersonalitySelector';
import HomePage from './pages/HomePage';
import PersonalPage from './pages/PersonalPage';
import CorporatePage from './pages/CorporatePage';
import InvestorPage from './pages/InvestorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExplorerPage from './pages/ExplorerPage';
import './hdbank-theme.css';
import './App.css';

// Inner App Content with context access
const AppContent: React.FC = () => {
  const { needsPersonalitySetup, markPersonalitySetup, isAuthenticated } = useAuth();
  const { setSelectedPersonality } = useChat();

  const handlePersonalitySelect = (personality: BankingPersonality) => {
    // Set personality in ChatContext
    setSelectedPersonality(personality);
    
    // Mark personality setup as completed
    markPersonalitySetup();
    
    console.log('🎭 Personality selected:', personality.displayName);
  };

  return (
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
            <Route path="/explorer" element={<ExplorerPage />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Global ChatBot - persistent across all pages */}
        <ChatBot />
        
        {/* Personality Selector Modal - shows when needed */}
        <PersonalitySelector
          isOpen={isAuthenticated && needsPersonalitySetup}
          onSelect={handlePersonalitySelect}
          title="Thiết lập trợ lý tài chính của bạn - HDBank"
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
