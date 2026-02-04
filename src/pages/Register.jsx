import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { Lock, Mail, User, Loader, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import hotelLobby from '../assets/luxury_hotel_lobby.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 relative">
      <Link to="/" className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium z-50">
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={hotelLobby} 
          alt="Luxury Hotel Lobby" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end h-full p-16 text-white pb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-serif font-bold mb-6"
          >
            Begin Your <br/> Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-white/90 font-light max-w-md"
          >
            Join LuxuryStay today and unlock a world of unparalleled comfort, exclusive offers, and unforgettable experiences.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Please fill in your details to sign up</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-green-50 rounded-2xl border border-green-100"
            >
              <div className="flex justify-center mb-4">
                 <CheckCircle className="text-green-500" size={64} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">Account Created!</h3>
              <p className="text-slate-500">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-sans dark:text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-sans dark:text-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-sans dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-sans dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-700 text-white py-4 rounded-xl font-medium hover:bg-primary-800 focus:ring-4 focus:ring-primary-700/20 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-primary-700/20 mt-4"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="relative my-6">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                 </div>
                 <div className="relative flex justify-center text-sm">
                   <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
                 </div>
              </div>

              <div className="flex justify-center">
                 <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const user = await googleLogin(credentialResponse.credential);
                        if (user) {
                           // Check role to redirect
                           if (['admin', 'manager', 'receptionist', 'housekeeping', 'hotel_staff'].includes(user.role)) {
                              navigate('/dashboard');
                           } else {
                              navigate('/');
                           }
                        }
                      } catch (err) {
                        setError("Google Signup Failed");
                      }
                    }}
                    onError={() => {
                      setError("Google Signup Failed");
                    }}
                    useOneTap
                    text="signup_with"
                 />
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
