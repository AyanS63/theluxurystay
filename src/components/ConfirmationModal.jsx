import React from 'react';
import { AlertTriangle, CheckCircle, Trash2, Info, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      icon: Trash2,
      color: 'bg-red-100 text-red-600',
      btnColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      defaultTitle: 'Are you sure?'
    },
    warning: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600',
      btnColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      defaultTitle: 'Warning'
    },
    success: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      btnColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      defaultTitle: 'Success'
    },
    info: {
      icon: Info,
      color: 'bg-blue-100 text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      defaultTitle: 'Info'
    }
  };

  const { icon: Icon, color, btnColor, defaultTitle } = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
           <div className={`p-3 rounded-full ${color} mb-4`}>
              <Icon size={24} />
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {title || defaultTitle}
           </h3>
           <p className="text-slate-500 dark:text-slate-400">
              {message}
           </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
           <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-transform active:scale-95 ${btnColor}`}
           >
              {confirmText}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
