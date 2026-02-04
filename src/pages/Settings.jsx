import React, { useState } from 'react';
import { Save, User, Bell, Shield, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);

  // Mock form data for profile
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Profile update functionality would go here.');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Settings</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit overflow-hidden">
          <nav className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col">
             <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 md:px-6 md:py-4 text-center md:text-left font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-b-4 md:border-b-0 md:border-l-4 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <User size={18} /> <span className="hidden sm:inline">Profile</span><span className="sm:hidden">Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 md:px-6 md:py-4 text-center md:text-left font-medium transition-colors ${
                activeTab === 'notifications' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-b-4 md:border-b-0 md:border-l-4 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Bell size={18} /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Notify</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 md:px-6 md:py-4 text-center md:text-left font-medium transition-colors ${
                activeTab === 'security' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-b-4 md:border-b-0 md:border-l-4 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Shield size={18} /> <span className="hidden sm:inline">Security</span><span className="sm:hidden">Security</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      className="input-field bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                      disabled 
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive emails about new bookings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="card">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Security</h3>
              <form className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                   <input type="password" className="input-field" />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                   <input type="password" className="input-field" />
                </div>
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
