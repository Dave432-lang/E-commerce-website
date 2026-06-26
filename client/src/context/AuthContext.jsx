import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('boutique_token');
      const savedUser = localStorage.getItem('boutique_user');

      if (token && savedUser) {
        try {
          // Verify token by fetching the fresh user profile from backend
          const freshUser = await authService.getProfile();
          setUser(freshUser);
          localStorage.setItem('boutique_user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Failed to auto-authenticate user:', error);
          // Token expired or invalid, clear localStorage
          logout();
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      
      // Store token and user data
      localStorage.setItem('boutique_token', data.token);
      
      const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
      localStorage.setItem('boutique_user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login Context Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      
      // Store token and user data
      localStorage.setItem('boutique_token', data.token);
      
      const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
      localStorage.setItem('boutique_user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Register Context Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('boutique_token');
    localStorage.removeItem('boutique_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
