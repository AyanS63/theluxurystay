import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        clearNotification, 
        clearAllNotifications,
        getNotificationStyle 
    } = useNotification();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-full transition-all duration-200 relative
                    ${isOpen ? 'bg-primary-50 text-primary-600 dark:bg-slate-700 dark:text-primary-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}
                `}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-4 right-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 w-auto sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
                    >

                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAsRead()}
                                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1"
                                    >
                                        <Check size={14} />
                                        Read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => clearAllNotifications()}
                                        className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[calc(100vh-8rem)] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                    <Bell size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {notifications.map((notif) => {
                                        const style = getNotificationStyle(notif.type);
                                        const Icon = style.icon;
                                        
                                        return (
                                            <div 
                                                key={notif._id}
                                                className={`
                                                    p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 group relative
                                                    ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}
                                                `}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className={`
                                                        mt-1 p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center
                                                        ${style.bg} ${style.color}
                                                    `}>
                                                        <Icon size={16} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            {new Date(notif.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Actions (visible on hover) */}
                                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                        {!notif.isRead && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                                                title="Mark as read"
                                                                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                                                            >
                                                                <div className="h-2 w-2 bg-primary-500 rounded-full" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); clearNotification(notif._id); }}
                                                            title="Remove"
                                                            className="text-slate-400 hover:text-red-500"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
