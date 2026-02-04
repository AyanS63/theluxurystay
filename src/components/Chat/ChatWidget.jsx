import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, X, Send, User, ChevronLeft, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
  const { 
    isOpen, 
    setIsOpen, 
    activeChat, 
    setActiveChat, 
    users, 
    messages, 
    sendMessage, 
    fetchMessages 
  } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat, isOpen]);

  // Focus input when chat opens or active chat changes
  useEffect(() => {
    if (isOpen && activeChat && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, activeChat]);

  const handleUserSelect = (selectedUser) => {
    setActiveChat(selectedUser);
    fetchMessages(selectedUser._id);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    sendMessage(activeChat._id, newMessage);
    setNewMessage('');
    scrollToBottom();
  };

  if (!user) return null;



  return (
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, originY: 1, originX: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden flex flex-col font-sans
                w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] m-4 rounded-2xl
                sm:w-[360px] md:w-[400px] md:h-[600px] md:m-0 md:mb-4
              `}
              style={{ boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Header */}
              <div className={`p-4 text-white flex justify-between items-center transition-colors duration-300 ${activeChat ? 'bg-gradient-to-r from-primary-600 to-primary-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
                <div className="flex items-center gap-3">
                  {activeChat && (
                    <button 
                      onClick={() => setActiveChat(null)} 
                      className="hover:bg-white/20 p-1.5 rounded-full transition-colors -ml-2"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {activeChat ? (
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold border-2 border-white/30">
                          {activeChat.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary-700 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <MessageCircle size={20} />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        {activeChat ? activeChat.username : 'Messenger'}
                      </h3>
                      <p className="text-xs text-white/70 font-medium">
                        {activeChat ? 'Online' : 'Team Support'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/80 hover:text-white">
                    <MoreVertical size={18} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/80 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                <AnimatePresence mode="wait">
                  {!activeChat ? (
                    // User List View
                    <motion.div 
                      key="user-list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full overflow-y-auto p-2"
                    >
                       <div className="px-4 py-3">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contacts</h4>
                       </div>
                       
                       <div className="space-y-1">
                        {users.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                             <User size={40} className="mb-2 opacity-20" />
                             <p>No contacts found.</p>
                          </div>
                        ) : (
                          users.map(u => (
                            <motion.div 
                              key={u._id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleUserSelect(u)}
                              className="group flex items-center gap-4 p-3 mx-2 rounded-xl cursor-pointer hover:shadow-sm transition-all border border-transparent hover:border-slate-100 hover:bg-white dark:hover:bg-slate-800 dark:hover:border-slate-700"
                            >
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 border-2 border-white rounded-full group-hover:bg-emerald-400 transition-colors"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.username}</p>
                                  <span className="text-[10px] text-slate-400">Now</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                  {u.role}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    // Chat Messages View
                    <motion.div 
                      key="chat-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col h-full"
                    >
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="text-center py-4">
                           <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-slate-500 dark:text-slate-400">
                             {activeChat.username.charAt(0).toUpperCase()}
                           </div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Start of your history with <span className="font-bold text-slate-700 dark:text-slate-200">{activeChat.username}</span></p>
                        </div>

                        {messages.map((msg, index) => {
                          const isMe = msg.sender._id === user._id || msg.sender === user._id; // Handle sender population
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={index} 
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2 mt-auto mb-1">
                                   {activeChat.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div 
                                className={`max-w-[75%] p-3.5 shadow-sm text-sm relative group ${
                                  isMe 
                                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm' 
                                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                                }`}
                              >
                                <p className="leading-relaxed">{msg.message}</p>
                                <span className={`text-[9px] mt-1 block text-right opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-2 ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleSend} className="relative flex items-center gap-2">
                          <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary-300 focus:ring-4 focus:ring-primary-50 dark:focus:ring-primary-900/10 rounded-xl px-4 py-3 text-sm dark:text-white transition-all outline-none"
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit" 
                            disabled={!newMessage.trim()}
                            className="bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                          >
                            <Send size={18} />
                          </motion.button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-full shadow-2xl shadow-primary-900/30 flex items-center justify-center hover:shadow-primary-600/50 transition-all border-4 border-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
              >
                <X size={32} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
              >
                <MessageCircle size={32} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Notification Dot (Optional Logic) */}
          {/* <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span> */}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWidget;
