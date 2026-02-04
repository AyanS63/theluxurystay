import React, { useState } from 'react';
import api from '../utils/api';
import { Mail, Loader, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email address to reset your password.</p>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm text-center border border-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft size={16} /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
