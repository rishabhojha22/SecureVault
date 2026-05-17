import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vaultAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Vault Dashboard Page
 * 
 * Displays all vault items for the current user.
 * 
 * Features:
 * - View all credentials
 * - Search credentials
 * - Show/hide passwords
 * - Add new credential
 * - Edit/delete credentials
 */

const VaultDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState({});

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await vaultAPI.getVaultItems();
      setItems(response.data.items);
      setError('');
    } catch (err) {
      setError('Failed to load vault items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }

    try {
      setLoading(true);
      const response = await vaultAPI.searchVaultItems(searchQuery);
      setItems(response.data.items);
      setError('');
    } catch (err) {
      setError('Search failed');
      console.error('Error searching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (itemId) => {
    setShowPasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      await vaultAPI.deleteVaultItem(itemId);
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getCategoryColor = (category) => {
    const colors = {
      website: 'bg-blue-500/20 text-blue-400',
      api: 'bg-purple-500/20 text-purple-400',
      note: 'bg-yellow-500/20 text-yellow-400',
      other: 'bg-gray-500/20 text-gray-400'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Header */}
      <header className="bg-cyber-light border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyber-accent">SecureVault</h1>
            <p className="text-gray-400 text-sm">Welcome, {user?.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-cyber-purple hover:bg-purple-600 text-white rounded-lg transition"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-cyber-danger hover:bg-red-600 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search credentials..."
                className="w-full px-4 py-2 pl-10 bg-cyber-light border border-gray-600 rounded-lg focus:outline-none focus:border-cyber-accent text-white"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <button
            onClick={() => navigate('/vault/add')}
            className="w-full md:w-auto px-6 py-2 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold rounded-lg transition"
          >
            + Add Credential
          </button>
        </div>

        {error && (
          <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-accent mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading vault items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No credentials yet</h3>
            <p className="text-gray-500 mb-4">Add your first credential to get started</p>
            <button
              onClick={() => navigate('/vault/add')}
              className="px-6 py-2 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold rounded-lg transition"
            >
              Add Your First Credential
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="bg-cyber-light rounded-lg border border-gray-700 hover:border-cyber-accent/50 transition p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyber-accent hover:underline"
                      >
                        {item.website}
                      </a>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Username:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{item.username}</span>
                      <button
                        onClick={() => copyToClipboard(item.username)}
                        className="text-gray-500 hover:text-cyber-accent"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Password:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">
                        {showPasswords[item._id] ? item.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(item._id)}
                        className="text-gray-500 hover:text-cyber-accent"
                      >
                        {showPasswords[item._id] ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.password)}
                        className="text-gray-500 hover:text-cyber-accent"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {item.apiKey && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">API Key:</span>
                      <span className="text-white text-xs truncate max-w-[150px]">{item.apiKey}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-gray-400 text-xs">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => navigate(`/vault/edit/${item._id}`)}
                    className="px-3 py-1 text-sm bg-cyber-blue hover:bg-blue-600 text-white rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 text-sm bg-cyber-danger hover:bg-red-600 text-white rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VaultDashboard;
