import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page
 * 
 * Allows new users to create an account.
 * 
 * Security Features:
 * - Strong password validation
 * - Email validation
 * - Username validation
 * - Error handling
 */

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePassword = (password) => {
    // At least 8 characters
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    // At least one number
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    // At least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
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

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate('/vault');
    } else {
      setError(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-darker px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-cyber-light rounded-lg shadow-2xl p-8 border border-cyber-accent/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyber-accent mb-2">SecureVault</h1>
            <p className="text-gray-400">Secure Password Manager</p>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create Account</h2>

          {error && (
            <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white placeholder-gray-500"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>

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
                placeholder="Create a strong password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ chars with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white placeholder-gray-500"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyber-accent hover:text-cyber-accentHover">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Your passwords are encrypted with AES-256</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
