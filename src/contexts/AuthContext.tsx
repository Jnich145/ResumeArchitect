import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  currentUser: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getTotalUsers: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = 'http://localhost:3001/api'; // Adjust this if your server runs on a different port

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Implement token validation
      setCurrentUser(token);
    }
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser(data.token);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error instanceof Error ? error : new Error('An unknown error occurred');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser(data.token);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const getTotalUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/count`);
      if (!response.ok) {
        throw new Error('Failed to fetch user count');
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }
  };

  const value = {
    currentUser,
    signUp,
    signIn,
    signOut,
    getTotalUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
