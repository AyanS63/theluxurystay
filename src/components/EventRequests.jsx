import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Users, CheckCircle, XCircle, Clock, Phone, Mail, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const EventRequests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this event as ${newStatus}?`)) return;
    try {
      await api.put(`/events/${id}/status`, { status: newStatus });
      fetchEvents();
    } catch (err) {
      console.error('Failed to update event status', err);
      alert('Failed to update status');
    }
  };

  const handlePayment = async (event) => {
      const amountStr = prompt(`Enter payment amount for ${event.eventType} (e.g. 5000):`, event.cost || '');
      if (!amountStr) return;
      
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
          alert("Please enter a valid amount");
          return;
      }

      try {
          await api.post(`/events/${event._id}/invoice`, { 
              amount, 
              markAsPaid: true 
          });
          // alert("Payment recorded successfully! Revenue updated."); 
          fetchEvents();
      } catch (err) {
          console.error("Payment error", err);
          alert("Failed to record payment");
      }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 dark:text-white">Event Bookings & Inquiries</h2>
        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
            {events.filter(e => e.status === 'Pending').length} Pending
        </span>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden">
        {events.map((event) => (
          <div key={event._id} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{event.eventType}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                     <Calendar size={12} /> {format(new Date(event.date), 'PPP')}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                   event.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                   event.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                   event.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                   'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                   {event.status}
                </span>
             </div>
             
             <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                <div className="font-medium">{event.contactInfo?.name}</div>
                <div className="text-xs text-slate-500">{event.contactInfo?.email}</div>
             </div>
             
             {event.requirements && (
                <div className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded mb-3 text-slate-600 dark:text-slate-400">
                   {event.requirements}
                </div>
             )}
             
             {event.status === 'Pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(event._id, 'Confirmed')}
                    className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-green-100"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                    className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-red-100"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
             )}
              {event.status === 'Confirmed' && (
                 <div className="flex flex-col gap-2 mt-2">
                    {event.cost > 0 ? (
                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1.5 rounded-lg border border-green-100 flex items-center justify-center gap-1">
                            <DollarSign size={12} /> Paid: ${event.cost.toLocaleString()}
                        </div>
                    ) : (
                         <button 
                            onClick={() => handlePayment(event)}
                            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                         >
                            <DollarSign size={12} /> Record Payment
                         </button>
                    )}
                    <button 
                        onClick={() => handleStatusUpdate(event._id, 'Completed')}
                        className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 py-1"
                    >
                        Mark Completed
                    </button>
                 </div>
              )}
          </div>
        ))}
        {events.length === 0 && (
             <div className="p-8 text-center text-slate-500 text-sm">No event inquiries yet.</div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Event Details</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Requirements</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 dark:text-white">{event.eventType}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-1">
                    <Calendar size={12} /> {format(new Date(event.date), 'PPP')}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <Users size={12} /> {event.guests} Guests
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700 dark:text-slate-300">{event.contactInfo?.name}</div>
                  <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                    <span className="flex items-center gap-1"><Mail size={10}/> {event.contactInfo?.email}</span>
                    <span className="flex items-center gap-1"><Phone size={10}/> {event.contactInfo?.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600 dark:text-slate-300 max-w-xs truncate" title={event.requirements}>
                    {event.requirements || 'No special requirements'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    event.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                    event.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    event.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {event.status === 'Pending' && <Clock size={12} />}
                    {event.status === 'Confirmed' && <CheckCircle size={12} />}
                    {event.status === 'Cancelled' && <XCircle size={12} />}
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {event.status === 'Pending' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(event._id, 'Confirmed')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                  {event.status === 'Confirmed' && (
                     <div className="flex flex-col items-end gap-1">
                        {event.cost > 0 ? (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                <DollarSign size={10} /> Paid: ${event.cost.toLocaleString()}
                            </span>
                        ) : (
                             <button 
                                onClick={() => handlePayment(event)}
                                className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded transition-colors"
                             >
                                <DollarSign size={12} /> Record Payment
                             </button>
                        )}
                        <button 
                            onClick={() => handleStatusUpdate(event._id, 'Completed')}
                            className="text-[10px] font-bold text-primary-600 hover:underline mt-1"
                        >
                            Mark Completed
                        </button>
                     </div>
                  )}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                        No event inquiries yet.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventRequests;
