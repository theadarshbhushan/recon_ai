import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify token on application mount
  useEffect(() => {
    const verifyTokenOnLoad = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await getMe();
          setUser(userData);
          setToken(savedToken);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Initial token verification failed:', err);
          // Token is invalid/expired; wipe it
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    verifyTokenOnLoad();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      // Fetch user profile info
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const register = async (email, password, fullName) => {
    return await registerUser(email, password, fullName);
  };

  const logout = () => {
    // Clear storage and state
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
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
