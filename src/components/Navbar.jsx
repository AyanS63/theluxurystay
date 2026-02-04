import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, UserCircle, Loader, LogOut, Calendar, Settings as SettingsIcon, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  // ... (rest of state omitted for brevity, logic remains same)
  const [results, setResults] = useState({ users: [], rooms: [], bookings: [] });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ... (useEffect hooks remain same)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ... logic
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }

    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ... (rest of useEffects and handlers remain same)



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await api.get(`/search?q=${query}`);
          setResults(res.data);
          setShowResults(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (path, searchParam = '') => {
    navigate(`${path}${searchParam ? `?search=${encodeURIComponent(searchParam)}` : ''}`);
    setShowResults(false);
    setQuery('');
  };

  const isStaff = user?.role === 'hotel_staff';

  return (
    <header className={`h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 ${isStaff ? 'left-0' : 'left-0 md:left-64'} z-10 transition-all duration-300`}>
      {!isStaff ? (
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Sidebar Toggle */}
          <button 
             onClick={toggleSidebar}
             className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
             <Menu size={24} />
          </button>

          <div className="relative w-full max-w-sm hidden md:block" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-100 dark:text-gray-100 transition-all placeholder:text-slate-400"
              />
              {loading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 animate-spin" size={16} />}
            </div>
            
            <AnimatePresence>
            {showResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-96 overflow-auto py-2 z-20"
              >
                {results.users.length > 0 && (
                  <div className="px-4 py-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Users</h4>
                    {results.users.map(user => (
                      <div key={user._id} onClick={() => handleResultClick('/dashboard/users', user.username)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {results.rooms.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Rooms</h4>
                    {results.rooms.map(room => (
                      <div key={room._id} onClick={() => handleResultClick('/dashboard/rooms', room.roomNumber)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-200 flex justify-between">
                        <span>Room {room.roomNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{room.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.bookings.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Bookings</h4>
                    {results.bookings.map(booking => (
                      <div key={booking._id} onClick={() => handleResultClick('/dashboard/bookings', booking.userDetails?.[0]?.username)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                         <div className="font-medium">Guest: {booking.userDetails?.[0]?.username || 'Unknown'}</div>
                         <div className="text-xs text-slate-500">Room {booking.roomDetails?.[0]?.roomNumber} • {booking.status}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {results.users.length === 0 && results.rooms.length === 0 && results.bookings.length === 0 && (
                   <div className="px-4 py-4 text-center text-slate-500 text-sm">No results found</div>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
           {/* Staff Mobile Sidebar Toggle (if needed, or just keep Logo) */}
           {/* Assume staff dashboard is simpler or they don't have this sidebar? Layout said {isStaff ? '' : 'ml-64'} so maybe Staff doesn't have Sidebar at all locally? */}
           {/* Checking DashboardLayout: !isStaff && <Sidebar />. So Staff has NO Sidebar. */}
           <div className="text-xl font-bold font-serif text-primary-700">LuxuryStay</div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationDropdown />
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div className="relative" ref={menuRef}>
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors select-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
            </div>
            <UserCircle size={32} className="text-primary-300" />
          </div>

          <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20 overflow-hidden"
            >
              <div className="md:hidden px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                 <p className="font-medium text-slate-800 dark:text-slate-200">{user?.username}</p>
                 <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <SettingsIcon size={16} /> Profile & Settings
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
