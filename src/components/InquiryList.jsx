import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Mail, Clock, CheckCircle, Reply, Send, Loader, X } from 'lucide-react';
import { format } from 'date-fns';

const InquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/inquiries');
      setInquiries(res.data);
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReplyClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyMessage('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await api.post(`/inquiries/${selectedInquiry._id}/reply`, { replyMessage });
      
      // Update local state
      setInquiries(inquiries.map(i => 
        i._id === selectedInquiry._id 
          ? { ...i, status: 'Replied', reply: replyMessage, repliedAt: new Date() } 
          : i
      ));
      
      setSelectedInquiry(null);
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Failed to send reply', err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-slate-500">Loading inquiries...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 dark:text-white">Guest Messages & Inquiries</h2>
        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
            {inquiries.filter(i => i.status === 'Pending').length} Pending
        </span>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden">
        {inquiries.map((inquiry) => (
          <div key={inquiry._id} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{inquiry.subject}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                     {format(new Date(inquiry.createdAt), 'MMM d, yyyy')} • {inquiry.name}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                   inquiry.status === 'Replied' ? 'bg-green-50 text-green-700 border-green-100' :
                   'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>
                   {inquiry.status}
                </span>
             </div>
             
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3">
                {inquiry.message}
             </p>

             {inquiry.status === 'Pending' ? (
                <button 
                  onClick={() => handleReplyClick(inquiry)}
                  className="w-full py-2 bg-primary-50 text-primary-700 text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-100 transition-colors"
                >
                  <Reply size={14} /> Reply
                </button>
             ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold block mb-1">Reply:</span>
                    {inquiry.reply}
                </div>
             )}
          </div>
        ))}
         {inquiries.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No inquiries yet.</div>}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Guest / Subject</th>
              <th className="px-6 py-3 font-medium">Message</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {inquiries.map((inquiry) => (
              <tr key={inquiry._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 dark:text-white">{inquiry.subject}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    {inquiry.name} • {inquiry.email}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {format(new Date(inquiry.createdAt), 'MMM d, h:mm a')}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-slate-600 dark:text-slate-300 truncate" title={inquiry.message}>
                    {inquiry.message}
                  </p>
                  {inquiry.reply && (
                      <p className="text-xs text-slate-400 mt-1 truncate italic" title={`Reply: ${inquiry.reply}`}>
                         <Reply size={10} className="inline mr-1"/> {inquiry.reply}
                      </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                     inquiry.status === 'Replied' ? 'bg-green-50 text-green-700 border-green-100' :
                     'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                     {inquiry.status === 'Pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                     {inquiry.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {inquiry.status === 'Pending' && (
                     <button 
                       onClick={() => handleReplyClick(inquiry)}
                       className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                       title="Reply"
                     >
                       <Reply size={18} />
                     </button>
                  )}
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                        No inquiries yet.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold font-serif text-slate-800 dark:text-white mb-4">Reply to {selectedInquiry.name}</h3>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-4 text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                 <p className="font-bold text-xs text-slate-400 uppercase mb-1">Original Message</p>
                 <p className="italic">"{selectedInquiry.message}"</p>
              </div>

              <form onSubmit={handleSendReply}>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Reply</label>
                 <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all font-medium text-slate-800 dark:text-white mb-4"
                    placeholder="Type your response here..."
                    required
                 ></textarea>
                 
                 <div className="flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setSelectedInquiry(null)}
                      className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={sendingReply}
                      className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-lg flex items-center gap-2"
                    >
                       {sendingReply ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                       Send Reply
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default InquiryList;
