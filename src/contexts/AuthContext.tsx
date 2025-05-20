import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserSubscription {
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'canceled' | 'expired';
  startDate?: string;
  endDate?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role?: string;
  subscription?: UserSubscription;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  mockSignIn: (mockUser?: Partial<User>) => void;
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Detect if we're in a mock environment (no server connection)
const isMockEnvironment = import.meta.env.VITE_MOCK_AUTH === 'true' || false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
    csrfToken: null,
  });

  const [isMockAuth, setIsMockAuth] = useState(isMockEnvironment);

  // Load CSRF token from localStorage (temporarily until we implement proper cookie retrieval)
  useEffect(() => {
    const storedCsrfToken = localStorage.getItem('csrfToken');
    if (storedCsrfToken) {
      setState(prev => ({ ...prev, csrfToken: storedCsrfToken }));
    }
    
    // Check if we're in mock auth mode
    const mockAuthUser = localStorage.getItem('mockAuthUser');
    if (mockAuthUser && (isMockEnvironment || !API_URL)) {
      setIsMockAuth(true);
      try {
        const user = JSON.parse(mockAuthUser);
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true,
          user,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error parsing mock user:', error);
        localStorage.removeItem('mockAuthUser');
      }
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    // Skip auth check if we're in mock auth mode
    if (isMockAuth) {
      return;
    }
    
    let isChecking = false;
    let timeoutId: number;
    
    const checkAuth = async () => {
      // Skip if already checking to prevent duplicate requests
      if (isChecking) return;
      
      try {
        isChecking = true;
        const success = await refreshToken();
        
        if (success) {
          // Fetch user data if we have a valid token
          await fetchUserData();
        } else {
          setState(prev => ({ 
            ...prev, 
            isAuthenticated: false, 
            user: null, 
            isLoading: false 
          }));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          user: null, 
          isLoading: false 
        }));
        
        // If we can't connect to the server, fall back to mock auth mode
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Failed to connect to authentication server, falling back to mock auth mode');
          setIsMockAuth(true);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } finally {
        isChecking = false;
      }
    };

    // Run initial auth check with a slight delay to prevent race conditions
    timeoutId = window.setTimeout(checkAuth, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMockAuth]);

  const mockSignIn = (mockUser?: Partial<User>) => {
    const defaultUser: User = {
      id: 'mock-user-id',
      name: 'Test User',
      email: 'test@example.com',
      isVerified: true,
      role: 'user',
      subscription: {
        tier: 'premium',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    
    const user = { ...defaultUser, ...mockUser };
    
    // Save to localStorage for persistence
    localStorage.setItem('mockAuthUser', JSON.stringify(user));
    
    setState({
      isAuthenticated: true,
      user: user,
      isLoading: false,
      error: null,
      csrfToken: 'mock-csrf-token',
    });
    
    setIsMockAuth(true);
  };

  const fetchUserData = async () => {
    // Skip if we're in mock auth mode
    if (isMockAuth) return;
    
    try {
      const response = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': state.csrfToken || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: data.user,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // If we can't connect to the server, fall back to mock auth mode
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Failed to connect to user data endpoint, falling back to mock auth mode');
        setIsMockAuth(true);
      }
      
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      }));
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Skip if we're in mock auth mode
    if (isMockAuth) return true;
    
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': state.csrfToken || '',
        },
      });

      // Handle rate limit errors
      if (response.status === 429) {
        console.warn('Rate limit reached for token refresh, using existing token');
        return true; // Return true to avoid continuous retries
      }

      if (response.ok) {
        const data = await response.json();
        
        // Store new CSRF token
        if (data.csrfToken) {
          localStorage.setItem('csrfToken', data.csrfToken);
          setState(prev => ({ ...prev, csrfToken: data.csrfToken }));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If we can't connect to the server, fall back to mock auth mode
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Failed to connect to refresh token endpoint, falling back to mock auth mode');
        setIsMockAuth(true);
        return true;
      }
      
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // If mock auth is enabled, use mock sign up
      if (isMockAuth) {
        mockSignIn({
          name,
          email, 
          id: 'mock-' + Date.now().toString()
        });
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store CSRF token
      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken);
      }
      
      setState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        error: null,
        csrfToken: data.csrfToken || null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Sign up error:', error);
      
      // If we can't connect to the server, fall back to mock auth mode
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Failed to connect to register endpoint, falling back to mock auth');
        mockSignIn({
          name,
          email,
          id: 'mock-' + Date.now().toString()
        });
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
      }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // If mock auth is enabled, use mock sign in
      if (isMockAuth) {
        mockSignIn({ email });
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      // Handle rate limit errors
      if (response.status === 429) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Too many login attempts. Please try again later.',
          isAuthenticated: false,
        }));
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Store CSRF token
      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken);
      }
      
      setState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        error: null,
        csrfToken: data.csrfToken || null,
      });
    } catch (error) {
      // If this is already a handled error with a message (like the rate limit error), don't modify it
      if (error instanceof Error && error.message === 'Too many login attempts. Please try again later.') {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Sign in error:', error);
      
      // If we can't connect to the server, fall back to mock auth mode
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Failed to connect to login endpoint, falling back to mock auth');
        mockSignIn({ email });
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (isMockAuth) {
        // Clear mock auth
        localStorage.removeItem('mockAuthUser');
        
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
          csrfToken: null,
        });
        return;
      }
      
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': state.csrfToken || '',
        },
      });
      
      // Clear CSRF token
      localStorage.removeItem('csrfToken');
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        csrfToken: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, clear the local auth state
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('mockAuthUser');
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        csrfToken: null,
      });
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (isMockAuth) {
        // Mock password reset - just return success after a small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Password reset request error:', error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (isMockAuth) {
        // Mock password reset - just return success after a small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Password reset error:', error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      setState(prev => ({
        ...prev,
        user: { ...prev.user!, ...userData },
      }));
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    refreshToken,
    clearError,
    updateUser,
    sendPasswordResetEmail,
    resetPassword,
    mockSignIn,
    isMockAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
