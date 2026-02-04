import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  LogOut, 
  LogIn,
  AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationContext = createContext();

import api from '../utils/api';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]); // Persistent notifications
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    if (user && ['admin', 'manager', 'receptionist', 'hotel_staff'].includes(user.role)) {
       fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
        console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (!socket || !user) return;

    // Only listen if user is staff/admin
    if (['admin', 'manager', 'receptionist', 'hotel_staff'].includes(user.role)) {
      
      const handleEvent = (type, data) => {
          // Add Toast
          addToast({ type, ...data });
          
          // Add to Persistent List locally (to avoid re-fetch lag)
          const newNotif = {
              _id: Date.now().toString(), // Temp ID until refresh
              type,
              message: data.message || 'New notification',
              isRead: false,
              createdAt: new Date(),
              data: data
          };
          
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
      };

      socket.bind('new_booking', (data) => handleEvent('booking', data));
      socket.bind('new_event', (data) => handleEvent('event', data));
      socket.bind('new_inquiry', (data) => handleEvent('inquiry', data));
      socket.bind('check_in', (data) => handleEvent('check_in', data));
      socket.bind('check_out', (data) => handleEvent('check_out', data));
      socket.bind('payment_received', (data) => handleEvent('payment_received', data));
      socket.bind('payment_reversed', (data) => handleEvent('payment_reversed', data));
      socket.bind('receive_message', (data) => handleEvent('message', { 
          message: `New message from ${data.sender.username}`, 
          data: data 
      }));

      return () => {
        socket.unbind('new_booking');
        socket.unbind('new_event');
        socket.unbind('new_inquiry');
        socket.unbind('check_in');
        socket.unbind('check_out');
        socket.unbind('payment_received');
        socket.unbind('payment_reversed');
        socket.unbind('receive_message');
      };
    }
  }, [socket, user?.role]);

  const addToast = (notification) => {
    const id = Date.now();
    setToasts((prev) => [{ id, ...notification }, ...prev]); 
    setTimeout(() => {
        removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(n => n.id !== id));
  };

  const markAsRead = async (id) => {
      try {
          // If id is provided, mark one. Else mark all.
          await api.put('/notifications/read', { id });

          if (id) {
              setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
          } else {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              setUnreadCount(0);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const clearNotification = async (id) => {
      try {
          await api.delete(`/notifications/${id}`);
          
          const notif = notifications.find(n => n._id === id);
          if (notif && !notif.isRead) {
              setUnreadCount(prev => Math.max(0, prev - 1));
          }
          setNotifications(prev => prev.filter(n => n._id !== id));
      } catch (err) {
          console.error(err);
      }
  };

  const clearAllNotifications = async () => {
    try {
        await api.delete('/notifications');
        setNotifications([]);
        setUnreadCount(0);
    } catch (err) {
        console.error(err);
    }
  };

  // Helper to get Icon and Color based on Type
  const getNotificationStyle = (type) => {
    switch(type) {
        case 'booking': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' };
        case 'event': return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500' };
        case 'message':
        case 'inquiry': return { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' };
        case 'check_in': return { icon: LogIn, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500' };
        case 'check_out': return { icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' };
        case 'payment_received': return { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500' };
        case 'refund': 
        case 'payment_reversed': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
        default: return { icon: Bell, color: 'text-primary-600', bg: 'bg-primary-500/10', border: 'border-primary-500' };
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        toasts, 
        notifications, 
        unreadCount, 
        markAsRead, 
        clearNotification,
        clearAllNotifications,
        addToast,
        removeToast,
        getNotificationStyle // Export this for both Toasts and Dropdown to usage
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
