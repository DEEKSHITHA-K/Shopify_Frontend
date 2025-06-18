// src/components/Login.js (Shopify-Inspired UI)
import React, { useState } from 'react';
import { LogIn, XCircle } from 'lucide-react';
import { loginUser } from '../services/api';

const Login = ({ onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      onLoginSuccess(email, password);
    } catch (err) {
      console.error("Login attempt error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-6 max-w-sm w-full mx-auto my-8 border border-gray-100">
      <button
        onClick={() => navigate('products')}
        className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
        aria-label="Close form"
      >
        <XCircle size={20} />
      </button>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-2">
        <LogIn size={28} className="text-indigo-600" /> Login
      </h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800 text-sm"
            placeholder="your.email@example.com"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800 text-sm"
            placeholder="********"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 font-semibold text-base flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Login
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600 text-sm">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('register')}
          className="text-indigo-600 hover:underline font-medium"
          disabled={loading}
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default Login;
