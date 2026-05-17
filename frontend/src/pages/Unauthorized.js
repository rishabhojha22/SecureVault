import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Unauthorized Page
 * 
 * Displayed when user tries to access a resource without proper permissions
 */

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-cyber-light rounded-lg border border-cyber-danger p-8">
          <svg className="mx-auto h-20 w-20 text-cyber-danger mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          
          <h1 className="text-3xl font-bold text-cyber-danger mb-4">Access Denied</h1>
          
          <p className="text-gray-400 mb-6">
            You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-cyber-light hover:bg-gray-700 text-white rounded-lg transition border border-gray-600"
            >
              Go Back
            </button>
            <Link
              to="/vault"
              className="w-full px-6 py-3 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold rounded-lg transition text-center"
            >
              Go to Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
