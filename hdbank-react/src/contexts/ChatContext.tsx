import React, { createContext, useContext, useState, useEffect } from 'react';
import { BankingPersonality } from '../components/ui/PersonalitySelector';

interface Message {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string;
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
  selectedPersonality: BankingPersonality | null;
  setSelectedPersonality: React.Dispatch<React.SetStateAction<BankingPersonality | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasNewMessage: boolean;
  setHasNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
  busy: boolean;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  typingMessageIndex: number | null;
  setTypingMessageIndex: React.Dispatch<React.SetStateAction<number | null>>;
  showPersonalities: boolean;
  setShowPersonalities: React.Dispatch<React.SetStateAction<boolean>>;
  connectionStatus: 'checking' | 'connected' | 'failed';
  setConnectionStatus: React.Dispatch<React.SetStateAction<'checking' | 'connected' | 'failed'>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state from localStorage
  const getPersistedState = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(`hdbank_chat_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [messages, setMessages] = useState<Message[]>(() => 
    getPersistedState('messages', [])
  );
  
  const [sessionId, setSessionId] = useState<string>(() => 
    getPersistedState('sessionId', crypto.randomUUID())
  );
  
  const [selectedPersonality, setSelectedPersonality] = useState<BankingPersonality | null>(() => 
    getPersistedState('selectedPersonality', null)
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [showPersonalities, setShowPersonalities] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('hdbank_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('hdbank_chat_sessionId', JSON.stringify(sessionId));
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('hdbank_chat_selectedPersonality', JSON.stringify(selectedPersonality));
  }, [selectedPersonality]);


  // Initialize session if needed
  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
  }, [sessionId]);

  const contextValue: ChatContextType = {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    selectedPersonality,
    setSelectedPersonality,
    isOpen,
    setIsOpen,
    hasNewMessage,
    setHasNewMessage,
    busy,
    setBusy,
    typingMessageIndex,
    setTypingMessageIndex,
    showPersonalities,
    setShowPersonalities,
    connectionStatus,
    setConnectionStatus,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
