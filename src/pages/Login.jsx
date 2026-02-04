import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, Loader, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import hotelLobby from "../assets/luxury_hotel_lobby.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = await login(email, password);

      if (
        [
          "admin",
          "manager",
          "receptionist",
          "housekeeping",
          "hotel_staff",
        ].includes(userData.role)
      ) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
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
            Experience the <br /> Extraordinary
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-white/90 font-light max-w-md"
          >
            Welcome to LuxuryStay, where every moment is crafted for your
            absolute comfort and delight.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Please enter your details to sign in
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all font-sans"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-700 text-white py-4 rounded-xl font-medium hover:bg-primary-800 focus:ring-4 focus:ring-primary-700/20 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-primary-700/20"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
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
                        if (['admin', 'manager', 'receptionist', 'housekeeping', 'hotel_staff'].includes(user.role)) {
                          navigate('/dashboard');
                        } else {
                          navigate('/');
                        }
                      }
                    } catch (err) {
                      setError("Google Login Failed");
                    }
                  }}
                  onError={() => {
                    setError("Google Login Failed");
                  }}
                  useOneTap
               />
            </div>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-700 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
