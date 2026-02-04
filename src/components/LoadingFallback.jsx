import React from 'react';
import { Loader } from 'lucide-react';

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader className="animate-spin text-primary-600" size={48} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading LuxuryStay...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
