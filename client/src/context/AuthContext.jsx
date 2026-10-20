import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

const getSafeToken = () => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('bugarena_token') : null;
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getSafeToken());
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('bugarena_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid, logging out:', err.message);
      localStorage.removeItem('bugarena_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('bugarena_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (username, email, password, college) => {
    const res = await authApi.register({ username, email, password, college });
    localStorage.setItem('bugarena_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('bugarena_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
