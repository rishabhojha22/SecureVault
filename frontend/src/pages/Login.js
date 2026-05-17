import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page
 * 
 * Allows users to login to their account.
 * 
 * Security Features:
 * - Password is never exposed in URL
 * - Form validation
 * - Error handling
 * - Redirects to intended page after login
 */

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/vault';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    const result = await login(formData);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-darker px-4">
      <div className="max-w-md w-full">
        <div className="bg-cyber-light rounded-lg shadow-2xl p-8 border border-cyber-accent/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyber-accent mb-2">SecureVault</h1>
            <p className="text-gray-400">Secure Password Manager</p>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>

          {error && (
            <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white placeholder-gray-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyber-accent hover:text-cyber-accentHover">
                Register
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Protected by AES-256 encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
