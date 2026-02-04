import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${
        theme === 'dark' 
          ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' 
          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
      }`}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
  );
};

export default ThemeToggle;
