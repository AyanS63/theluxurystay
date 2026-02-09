import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket(); // Use shared socket
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null); 
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ureadCount, setUnreadCount] = useState(0);

  // Connection logic is now handled in SocketContext. 
  // We only listen for messages here.

  useEffect(() => {
    if (socket) {
      // 'socket' is actually the Pusher channel here
      const handleMessage = (newMessage) => {


        // Prevent duplicate: Ignore if the message is from ME (since we already added it optimistically)
        const senderId = newMessage.sender._id || newMessage.sender;
        const myId = user._id || user.id;
        
        if (senderId === myId) {

             return;
        }

        // If chat is open with this user, add to messages
        if (activeChat && (senderId === activeChat._id)) {

          setMessages((prev) => {
            // Deduplicate by _id (Safety net)
            if (newMessage._id && prev.some(m => m._id === newMessage._id)) {
                return prev;
            }
            return [...prev, newMessage];
          });
        } else {

          setUnreadCount(previous => previous + 1);
        }
      };

      socket.bind('receive_message', handleMessage);
      
      return () => {
        socket.unbind('receive_message', handleMessage);
      };
    }
  }, [socket, activeChat]);

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/chat/history/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const sendMessage = async (receiverId, text) => {
    try {
        const messageData = {
            receiver: receiverId,
            message: text,
        };

        // Call API endpoint to send message and trigger Pusher
        await api.post('/chat/send', messageData);

        // Optimistically add to UI
        const optimisticMsg = {
            sender: { _id: user._id || user.id, username: user.username },
            receiver: receiverId,
            message: text,
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, optimisticMsg]);
    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await api.get('/users');
        let filteredUsers = [];
        if (user.role === 'receptionist') {
          filteredUsers = response.data.filter(u => u._id !== user._id);
        } else {
          filteredUsers = response.data.filter(u => u.role === 'receptionist');
        }
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    if (user) {
      fetchChatUsers();
    }
  }, [user]);


  return (
    <ChatContext.Provider value={{ 
      socket, 
      messages, 
      sendMessage, 
      activeChat, 
      setActiveChat, 
      fetchMessages,
      users,
      isOpen,
      setIsOpen,
      ureadCount,
      setUnreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
