import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vaultAPI } from '../services/api';

/**
 * Vault Form Page
 * 
 * Used for both adding and editing vault items.
 * 
 * Features:
 * - Add new credentials
 * - Edit existing credentials
 * - Form validation
 * - AES-256 encryption (handled by backend)
 */

const VaultForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    website: '',
    username: '',
    password: '',
    apiKey: '',
    notes: '',
    category: 'website',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await vaultAPI.getVaultItem(id);
      setFormData(response.data.item);
      setError('');
    } catch (err) {
      setError('Failed to load item');
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  };

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

    // Validation
    if (!formData.title || !formData.username || !formData.password) {
      setError('Please fill in required fields');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await vaultAPI.updateVaultItem(id, formData);
      } else {
        await vaultAPI.createVaultItem(formData);
      }
      navigate('/vault');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Header */}
      <header className="bg-cyber-light border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/vault')}
            className="text-cyber-accent hover:text-cyber-accentHover mb-2"
          >
            ← Back to Vault
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Credential' : 'Add New Credential'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
          {error && (
            <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
                placeholder="e.g., Gmail Account"
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username / Email *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
                placeholder="Enter username or email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
                placeholder="Enter password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your password will be encrypted with AES-256
              </p>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key (Optional)
              </label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
                placeholder="Enter API key"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
              >
                <option value="website">Website</option>
                <option value="api">API</option>
                <option value="note">Secure Note</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white resize-none"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Credential' : 'Add Credential')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/vault')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default VaultForm;
