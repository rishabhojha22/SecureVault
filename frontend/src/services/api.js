import axios from 'axios';

/**
 * API Service
 * 
 * This module handles all HTTP requests to the backend API.
 * 
 * Security Features:
 * - JWT token is automatically included in all requests
 * - Token is stored in localStorage
 * - Automatic token handling (add/remove)
 * - Centralized error handling
 * - Base URL configuration
 */

// Get API base URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor
 * Automatically adds JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common error scenarios
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: (userData) => api.post('/auth/register', userData),
  
  /**
   * Login user
   */
  login: (credentials) => api.post('/auth/login', credentials),
  
  /**
   * Get current user
   */
  getMe: () => api.get('/auth/me'),
  
  /**
   * Logout user
   */
  logout: () => api.post('/auth/logout')
};

/**
 * Vault API
 */
export const vaultAPI = {
  /**
   * Get all vault items for current user
   */
  getVaultItems: () => api.get('/vault'),
  
  /**
   * Get single vault item by ID
   */
  getVaultItem: (id) => api.get(`/vault/${id}`),
  
  /**
   * Create new vault item
   */
  createVaultItem: (itemData) => api.post('/vault', itemData),
  
  /**
   * Update vault item
   */
  updateVaultItem: (id, itemData) => api.put(`/vault/${id}`, itemData),
  
  /**
   * Delete vault item
   */
  deleteVaultItem: (id) => api.delete(`/vault/${id}`),
  
  /**
   * Search vault items
   */
  searchVaultItems: (query) => api.get(`/vault/search?q=${query}`)
};

/**
 * Admin API
 */
export const adminAPI = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: () => api.get('/admin/stats'),
  
  /**
   * Get all users
   */
  getAllUsers: () => api.get('/admin/users'),
  
  /**
   * Get user by ID
   */
  getUserById: (id) => api.get(`/admin/users/${id}`),
  
  /**
   * Update user role
   */
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  /**
   * Unlock user account
   */
  unlockUserAccount: (id) => api.put(`/admin/users/${id}/unlock`),
  
  /**
   * Get activity logs
   */
  getActivityLogs: (params = {}) => api.get('/admin/logs', { params }),
  
  /**
   * Delete user
   */
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export default api;
