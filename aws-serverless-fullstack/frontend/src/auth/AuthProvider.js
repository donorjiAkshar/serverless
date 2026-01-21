import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { tokenStorage } from '../utils/tokenStorage';
import { authAPI } from '../api/auth.api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          tokenStorage.clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { accessToken, idToken, refreshToken } = response;
      
      tokenStorage.setTokens(accessToken, idToken, refreshToken);
      
      const userData = await authAPI.getMe();
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
