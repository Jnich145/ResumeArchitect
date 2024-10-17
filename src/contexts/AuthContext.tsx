import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  currentUser: string | null;
  signUp: (email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    // In a real application, you would make an API call to create a new user
    localStorage.setItem('user', email);
    setCurrentUser(email);
    await updateTotalUsers(1);
  };

  const signIn = async (email: string, password: string) => {
    // In a real application, you would make an API call to authenticate the user
    localStorage.setItem('user', email);
    setCurrentUser(email);
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const getTotalUsers = async (): Promise<number> => {
    const response = await fetch('/api/users/count');
    const data = await response.json();
    return data.count;
  };

  const updateTotalUsers = async (increment: number): Promise<void> => {
    await fetch('/api/users/count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ increment }),
    });
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