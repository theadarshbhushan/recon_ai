import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getMe } from '../api/client';
import { saveKnownAccount } from '../utils/accountUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [loggingOut, setLoggingOut] = useState(false);

  // Synchronous initial token verification
  useEffect(() => {
    const verifyTokenOnLoad = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await getMe();
          setUser(userData);
          setIsAuthenticated(true);
          saveKnownAccount(userData);
        } catch (err) {
          // Only clear if the server definitively returned 401 Unauthorized
          if (err.response?.status === 401) {
            console.warn('Session expired or invalid token on load:', err);
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          } else {
            console.warn('Network issue while verifying session, preserving token:', err);
            // Keep token and assume valid until explicit 401
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
      const accessToken = data.access_token;
      
      // Store token
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      
      // Fetch user profile info
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
      saveKnownAccount(userData);
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
    try {
      const data = await registerUser(email, password, fullName);
      const accessToken = data.access_token;
      
      if (accessToken) {
        // Store token
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        
        // Fetch user profile info
        let userData = null;
        try {
          userData = await getMe();
          setUser(userData);
        } catch (profileErr) {
          console.warn('Failed to fetch profile info after registration:', profileErr);
          userData = { email, full_name: fullName };
          setUser(userData);
        }
        setIsAuthenticated(true);
        if (userData) {
          saveKnownAccount(userData);
        }
      }
      return data;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const logout = (redirectTo = '/', navigateOptions = {}) => {
    setLoggingOut(true);
    // Clear storage and state
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    if (redirectTo) {
      navigate(redirectTo, { replace: true, ...navigateOptions });
    }
    
    setTimeout(() => {
      setLoggingOut(false);
    }, 150);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        loggingOut,
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
