import React from 'react';
import InquiryList from '../components/InquiryList';
import { format } from 'date-fns';

const Inquiries = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Guest Inquiries</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Manage Messages
          </p>
        </div>
      </div>

      <InquiryList />
    </div>
  );
};

export default Inquiries;
