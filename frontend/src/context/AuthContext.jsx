import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const savedToken = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(savedToken);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(savedToken));
  const [loading, setLoading] = useState(Boolean(savedToken));

  // Verify token on application mount
  useEffect(() => {
    const verifyTokenOnLoad = async () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        try {
          const userData = await getMe();
          setUser(userData);
          setToken(currentToken);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Initial token verification failed:', err);
          // Only wipe if token is definitively rejected as 401 Unauthorized
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          } else {
            // Keep existing session active on non-401 errors (temporary network timeout)
            setIsAuthenticated(true);
          }
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
