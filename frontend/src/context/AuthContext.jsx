import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const isAuthenticated = !!user;

  // Fetch current user from /auth/me using the stored token
  const refreshUser = async () => {
    try {
      const data = await authAPI.me();
      if (data && data.success !== false && data.user) {
        setUser(data.user);
      } else if (data && data.user === undefined && data.id) {
        // In case the backend shape differs, fall back to whatever comes back
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        await refreshUser();
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    // Validate inputs before making API call
    if (!identifier || !password) {
      throw new Error('Please provide email/username and password');
    }

    const data = await authAPI.login(identifier, password);

    if (!data || data.success === false || !data.token) {
      throw new Error(data?.error || 'Invalid credentials');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }

    if (data.user) {
      setUser(data.user);
    } else {
      // Fallback: fetch /auth/me if user object is not present
      await refreshUser();
    }

    return data;
  };

  const register = async (payload) => {
    const data = await authAPI.register(payload);

    if (!data || data.success === false || !data.token) {
      throw new Error(data?.error || 'Registration failed');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }

    if (data.user) {
      setUser(data.user);
    } else {
      await refreshUser();
    }

    return data;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    initializing,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}


