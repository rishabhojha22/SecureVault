import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

/**
 * Authentication Context
 * 
 * This context manages authentication state across the application.
 * 
 * Features:
 * - User login/logout
 * - Token management
 * - Protected route checking
 * - Role-based access control (RBAC)
 * - Persistent authentication (localStorage)
 */

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state from localStorage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Store in state
        setToken(newToken);
        setUser(userData);

        // Store in localStorage for persistence
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        // Store in state
        setToken(newToken);
        setUser(newUser);

        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint
      await authAPI.logout();
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout error:', err);
    } finally {
      // Clear state
      setUser(null);
      setToken(null);

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return user && user.role === role;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
