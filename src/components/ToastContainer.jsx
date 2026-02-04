import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const ToastContainer = () => {
    const { toasts, removeToast, getNotificationStyle } = useNotification();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const style = getNotificationStyle(toast.type);
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            layout
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 p-4 w-80 pointer-events-auto flex gap-3 relative overflow-hidden"
                        >
                            {/* Colorful accent bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('/10', '')}`} />

                            <div className={`mt-0.5 p-1.5 rounded-full ${style.bg} ${style.color} self-start`}>
                                <Icon size={16} />
                            </div>

                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                                    {toast.type.replace('_', ' ')}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-start"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
