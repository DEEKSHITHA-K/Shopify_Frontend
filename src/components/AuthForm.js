// src/components/AuthForm.js
import React, { useState } from 'react';
import { LogIn, UserPlus, XCircle } from 'lucide-react';

const AuthForm = ({ mode, onLogin, onRegister, onSwitchMode, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else { // register mode
        await onRegister(name, email, password);
      }
      // Success is handled by onLogin/onRegister which updates App state
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto my-10 border border-gray-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
        aria-label="Close form"
      >
        <XCircle size={24} />
      </button>

      <h2 className="text-3xl font-bold text-center text-purple-700 mb-6 flex items-center justify-center gap-2">
        {mode === 'login' ? <LogIn size={28} /> : <UserPlus size={28} />}
        {mode === 'login' ? 'Login' : 'Register'}
      </h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-lg shadow-sm">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
        </div>
        {mode === 'register' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out transform hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
          className="text-indigo-600 hover:underline font-medium"
          disabled={loading}
        >
          {mode === 'login' ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
