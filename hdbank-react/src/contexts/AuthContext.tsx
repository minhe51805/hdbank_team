// Authentication Context for HDBank
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthAPI from '../services/authAPI';

interface User {
  id: number;
  customerId: number;
  username: string;
  email: string;
  phone: string;
  status: string;
  segment: string;
  age: number;
  income: number;
  balance: number;
  passwordChanged: boolean;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsPersonalitySetup: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  markPersonalitySetup: () => void;
  checkPersonalitySetup: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPersonalitySetup, setNeedsPersonalitySetup] = useState(false);

  // Helper functions for personality setup
  const checkPersonalitySetup = (): boolean => {
    try {
      const hasPersonality = localStorage.getItem('hdbank_chat_selectedPersonality');
      const setupCompleted = localStorage.getItem('hdbank_personality_setup_completed');
      return !!(hasPersonality && setupCompleted === 'true');
    } catch {
      return false;
    }
  };

  const markPersonalitySetup = () => {
    localStorage.setItem('hdbank_personality_setup_completed', 'true');
    setNeedsPersonalitySetup(false);
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = AuthAPI.getCurrentUser();
        const isTokenValid = await AuthAPI.verifyToken();

        if (currentUser && isTokenValid) {
          setUser(currentUser);
          console.log('✅ Auth initialized - User authenticated:', currentUser.username);
          
          // Check if personality setup is needed
          const hasPersonalitySetup = checkPersonalitySetup();
          setNeedsPersonalitySetup(!hasPersonalitySetup);
          
          if (!hasPersonalitySetup) {
            console.log('ℹ️ Personality setup needed for user:', currentUser.username);
          }
        } else {
          // Clear invalid session
          await AuthAPI.logout();
          setUser(null);
          setNeedsPersonalitySetup(false);
          console.log('ℹ️ Auth initialized - No valid session');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await AuthAPI.login(username, password);
      
      if (response.success) {
        setUser(response.user);
        console.log('✅ Login successful in context:', response.user.username);
        
        // Check if personality setup is needed after login
        const hasPersonalitySetup = checkPersonalitySetup();
        setNeedsPersonalitySetup(!hasPersonalitySetup);
        
        if (!hasPersonalitySetup) {
          console.log('🎭 Personality setup required after login');
        }
        
        // Show success message if password needs to be changed
        if (response.requirePasswordChange) {
          console.log('⚠️ Password change required on first login');
        }
      }
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthAPI.logout();
      setUser(null);
      setNeedsPersonalitySetup(false);
      // Clear personality setup flag on logout
      localStorage.removeItem('hdbank_personality_setup_completed');
      console.log('✅ Logout successful in context');
    } catch (error) {
      console.error('Logout error in context:', error);
      // Still clear user state even if API call fails
      setUser(null);
      setNeedsPersonalitySetup(false);
      localStorage.removeItem('hdbank_personality_setup_completed');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('hdbank_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    needsPersonalitySetup,
    login,
    logout,
    updateUser,
    markPersonalitySetup,
    checkPersonalitySetup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
