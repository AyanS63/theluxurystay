import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const GuestNavbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const getNavClasses = () => {
    if (transparent) {
      return isScrolled
        ? "fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md text-slate-900 dark:text-white transition-all duration-300"
        : "absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center text-white transition-all duration-300";
    }
    return "sticky top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm";
  };

  const getBrandClasses = () => {
    if (transparent && !isScrolled) return "text-2xl font-bold font-serif tracking-tight z-50 relative";
    return "text-2xl font-bold font-serif tracking-tight text-primary-700 dark:text-primary-500 z-50 relative";
  };

  const getLinkClasses = () => {
    const baseClasses = "relative px-2 py-1 font-medium transition-colors group";
    
    if (transparent && !isScrolled) {
      return { className: `${baseClasses} text-white/90 hover:text-white`, underlineColor: 'bg-primary-300' };
    }
    return { className: `${baseClasses} text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400`, underlineColor: 'bg-primary-600' };
  };

  const handleNavClick = (id) => {
     if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
           const element = document.getElementById(id);
           if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
     } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
     }
     setIsMobileMenuOpen(false);
  };

  return (
    <nav className={getNavClasses()}>
      <Link to="/" className={getBrandClasses()}>LuxuryStay</Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        {[
           { name: 'Home', path: '/', isLink: true },
           { name: 'Rooms & Suites', path: '/rooms', isLink: true },
           { name: 'Events', path: '/events', isLink: true },
           { name: 'About Us', path: '/about-us', isLink: true },
           { name: 'Contact Us', path: '/contact', isLink: true }
        ].map(item => {
           const { className, underlineColor } = getLinkClasses();
           return item.isLink ? (
             <Link key={item.name} to={item.path} className={className}>
               {item.name}
               <span className={`absolute left-0 bottom-0 w-0 h-0.5 ${underlineColor} transition-all duration-300 group-hover:w-full`}></span>
             </Link>
           ) : (
             <button key={item.name} onClick={() => handleNavClick(item.id)} className={className}>
               {item.name}
               <span className={`absolute left-0 bottom-0 w-0 h-0.5 ${underlineColor} transition-all duration-300 group-hover:w-full`}></span>
             </button>
           );
        })}
      </div>
      
      <div className="hidden md:flex gap-4 items-center">
         <ThemeToggle />
         {user ? (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${(transparent && !isScrolled) ? 'bg-white text-slate-900' : 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'} px-6 py-2.5 rounded-full font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors shadow-lg flex items-center gap-2`}
            >
              <User size={18} /> {user.username}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20 overflow-hidden animate-fade-in-up">
                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">Signed in as</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                 </div>
                 
                 {user.role !== 'guest' && (
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Settings size={16} /> Dashboard
                    </Link>
                 )}

                 {user.role === 'guest' && (
                   <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                     <Calendar size={16} /> My Bookings
                   </Link>
                 )}

                 <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                 
                 <button 
                   onClick={handleLogout}
                   className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                 >
                   <LogOut size={16} /> Sign Out
                 </button>
              </div>
            )}
          </div>
         ) : (
          <Link to="/login" className={`${(transparent && !isScrolled) ? 'bg-white text-slate-900' : 'bg-primary-600 text-white hover:bg-primary-700'} px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg`}>
            Sign In
          </Link>
         )}
      </div>

      {/* Mobile Toggle & Theme */}
      <div className="flex items-center gap-4 md:hidden z-50">
        <ThemeToggle />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-full transition-colors ${
             (transparent && !isScrolled && !isMobileMenuOpen) 
               ? 'text-white hover:bg-white/20' 
               : 'text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
           {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      {isMobileMenuOpen && (
         <div className="fixed top-0 left-0 w-full h-screen bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40 flex flex-col pt-24 px-6 animate-fade-in md:hidden overflow-y-auto">
            <div className="flex flex-col gap-6 text-center">
               {[
                  { name: 'Home', path: '/', isLink: true },
                  { name: 'Rooms & Suites', path: '/rooms', isLink: true },
                  { name: 'Events', path: '/events', isLink: true },
                  { name: 'About Us', path: '/about-us', isLink: true },
                  { name: 'Contact', path: '/contact', isLink: true }
               ].map(item => (
                  item.isLink ? (
                     <Link 
                       key={item.name} 
                       to={item.path} 
                       className="text-2xl font-serif font-bold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                       onClick={() => setIsMobileMenuOpen(false)}
                     >
                        {item.name}
                     </Link>
                  ) : (
                     <button
                        key={item.name}
                        onClick={() => handleNavClick(item.id)}
                        className="text-2xl font-serif font-bold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                     >
                        {item.name}
                     </button>
                  )
               ))}
            </div>

            <div className="mt-12 flex flex-col gap-4 max-w-xs mx-auto w-full pb-8">
               {user ? (
                  <>
                     <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <User size={20} className="text-primary-600" />
                        <span className="font-bold text-slate-800 dark:text-white">{user.username}</span>
                     </div>
                     
                     {user.role !== 'guest' ? (
                        <Link 
                           to="/dashboard" 
                           onClick={() => setIsMobileMenuOpen(false)}
                           className="flex items-center justify-center gap-2 btn-secondary w-full py-3 rounded-xl font-bold"
                        >
                           <Settings size={18} /> Dashboard
                        </Link>
                     ) : (
                        <Link 
                           to="/my-bookings" 
                           onClick={() => setIsMobileMenuOpen(false)}
                           className="flex items-center justify-center gap-2 btn-secondary w-full py-3 rounded-xl font-bold"
                        >
                           <Calendar size={18} /> My Bookings
                        </Link>
                     )}

                     <button 
                        onClick={handleLogout} 
                        className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 w-full py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                     >
                        <LogOut size={18} /> Sign Out
                     </button>
                  </>
               ) : (
                  <Link 
                     to="/login" 
                     className="btn-primary w-full py-4 rounded-xl text-lg font-bold text-center shadow-lg"
                     onClick={() => setIsMobileMenuOpen(false)}
                  >
                     Sign In
                  </Link>
               )}
            </div>
         </div>
      )}
    </nav>
  );
};

export default GuestNavbar;
