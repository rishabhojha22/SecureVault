import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Admin Dashboard Page
 * 
 * Displays admin-only information including:
 * - System statistics
 * - User management
 * - Activity logs
 * 
 * Security Features:
 * - Only accessible by admin users
 * - RBAC enforced on frontend
 * - Sensitive data protection
 */

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'stats') {
        const response = await adminAPI.getDashboardStats();
        setStats(response.data.stats);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getAllUsers();
        setUsers(response.data.users);
      } else if (activeTab === 'logs') {
        const response = await adminAPI.getActivityLogs({ limit: 50 });
        setLogs(response.data.logs);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await adminAPI.unlockUserAccount(userId);
      fetchData();
    } catch (err) {
      setError('Failed to unlock user');
      console.error('Error unlocking user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      fetchData();
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
    } catch (err) {
      setError('Failed to update role');
      console.error('Error updating role:', err);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN_SUCCESS': 'text-green-400',
      'LOGIN_FAILED': 'text-red-400',
      'REGISTER': 'text-blue-400',
      'VAULT_ITEM_CREATED': 'text-green-400',
      'VAULT_ITEM_UPDATED': 'text-yellow-400',
      'VAULT_ITEM_DELETED': 'text-red-400',
      'UNAUTHORIZED_ACCESS_ATTEMPT': 'text-red-400'
    };
    return colors[action] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Header */}
      <header className="bg-cyber-light border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyber-accent">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">SecureVault Administration</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vault')}
              className="px-4 py-2 bg-cyber-blue hover:bg-blue-600 text-white rounded-lg transition"
            >
              Vault
            </button>
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
        {error && (
          <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'stats'
                ? 'text-cyber-accent border-b-2 border-cyber-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'users'
                ? 'text-cyber-accent border-b-2 border-cyber-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'logs'
                ? 'text-cyber-accent border-b-2 border-cyber-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Activity Logs
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-accent mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-cyber-accent">{stats.totalUsers}</p>
                </div>
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Vault Items</h3>
                  <p className="text-3xl font-bold text-cyber-blue">{stats.totalVaultItems}</p>
                </div>
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Locked Accounts</h3>
                  <p className="text-3xl font-bold text-cyber-danger">{stats.lockedAccounts}</p>
                </div>
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Failed Logins (24h)</h3>
                  <p className="text-3xl font-bold text-cyber-danger">{stats.failedLogins}</p>
                </div>
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Successful Logins (24h)</h3>
                  <p className="text-3xl font-bold text-cyber-info">{stats.successfulLogins}</p>
                </div>
                <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
                  <h3 className="text-gray-400 text-sm mb-2">New Registrations (24h)</h3>
                  <p className="text-3xl font-bold text-cyber-purple">{stats.newRegistrations}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-cyber-light rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cyber-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-cyber-dark/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            className="text-sm bg-cyber-dark border border-gray-600 rounded px-2 py-1 text-white"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isLocked ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                              Locked
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {user.isLocked && (
                            <button
                              onClick={() => handleUnlockUser(user._id)}
                              className="text-cyber-accent hover:text-cyber-accentHover"
                            >
                              Unlock
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-cyber-danger hover:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="bg-cyber-light rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cyber-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-cyber-dark/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.user?.username || 'System'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
