import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home Page
 * 
 * Landing page for SecureVault
 */

const Home = () => {
  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Hero Section */}
      <header className="bg-cyber-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-cyber-accent mb-4">SecureVault</h1>
          <p className="text-xl text-gray-400 mb-8">
            Secure Password Manager with AES-256 Encryption
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-dark font-semibold rounded-lg transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-cyber-light hover:bg-gray-700 text-white font-semibold rounded-lg transition border border-gray-600"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Security Features</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AES-256 Encryption</h3>
            <p className="text-gray-400">
              All your passwords are encrypted using military-grade AES-256 encryption before storage.
            </p>
          </div>

          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Authentication</h3>
            <p className="text-gray-400">
              JWT-based authentication with password hashing using bcrypt for maximum security.
            </p>
          </div>

          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Account Lockout</h3>
            <p className="text-gray-400">
              Automatic account lockout after multiple failed login attempts to prevent brute-force attacks.
            </p>
          </div>

          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Activity Logging</h3>
            <p className="text-gray-400">
              Comprehensive logging of all security events for monitoring and auditing purposes.
            </p>
          </div>

          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access</h3>
            <p className="text-gray-400">
              Admin and user roles with granular permissions for secure access control.
            </p>
          </div>

          <div className="bg-cyber-light rounded-lg border border-gray-700 p-6">
            <div className="text-cyber-accent mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Rate Limiting</h3>
            <p className="text-gray-400">
              API rate limiting to protect against DDoS attacks and brute-force attempts.
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">React.js</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">Node.js</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">Express.js</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">MongoDB</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">JWT</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">bcrypt</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">AES-256</span>
            <span className="px-4 py-2 bg-cyber-light border border-gray-700 rounded-lg text-gray-300">TailwindCSS</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyber-darker border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>SecureVault - A demonstration of cybersecurity best practices</p>
          <p className="text-sm mt-2">Built for educational purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
