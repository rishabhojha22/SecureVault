import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VaultDashboard from './pages/VaultDashboard';
import VaultForm from './pages/VaultForm';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

/**
 * Main App Component
 * 
 * Sets up routing and authentication provider
 */

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/vault"
            element={
              <ProtectedRoute>
                <VaultDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/add"
            element={
              <ProtectedRoute>
                <VaultForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/edit/:id"
            element={
              <ProtectedRoute>
                <VaultForm />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Unauthorized Page */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
