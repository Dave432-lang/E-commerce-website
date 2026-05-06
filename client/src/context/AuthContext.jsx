import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is saved in localStorage
    const savedUser = localStorage.getItem('boutique_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find user in mock "database" (localStorage users)
        const users = JSON.parse(localStorage.getItem('boutique_all_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
          const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
          setUser(userData);
          localStorage.setItem('boutique_user', JSON.stringify(userData));
          setLoading(false);
          resolve(userData);
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  const register = async (name, email, password) => {
    // Mock register logic
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('boutique_all_users') || '[]');
        
        if (users.some(u => u.email === email)) {
          setLoading(false);
          reject(new Error('Email already exists'));
          return;
        }

        const newUser = { id: Date.now(), name, email, password };
        users.push(newUser);
        localStorage.setItem('boutique_all_users', JSON.stringify(users));

        const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
        setUser(userData);
        localStorage.setItem('boutique_user', JSON.stringify(userData));
        setLoading(false);
        resolve(userData);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('boutique_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
