import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader, Calendar, XCircle, FileText } from 'lucide-react';
import GuestNavbar from '../components/GuestNavbar';

import ConfirmationModal from '../components/ConfirmationModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const fetchData = async () => {
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/events')
      ]);
      setBookings(bookingsRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = (id) => {
    setConfirmation({
        isOpen: true,
        type: 'danger',
        title: 'Cancel Reservation',
        message: 'Are you sure you want to cancel this reservation? If you have paid, a refund will be processed automatically.',
        confirmText: 'Yes, Cancel',
        onConfirm: async () => {
            try {
                await api.put(`/bookings/${id}/status`, { status: 'Cancelled' });
                fetchData();
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            } catch (err) {
                console.error(err);
                alert('Failed to cancel booking');
            }
        }
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
       <GuestNavbar />
       <div className="p-6 flex justify-center mt-20"><Loader className="animate-spin text-primary-600" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <GuestNavbar />
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        
        {/* Bookings Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-white">My Bookings</h2>
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Room {booking.room?.roomNumber} <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">({booking.room?.type})</span></h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                       <span>Guests: {booking.guests}</span>
                       <span>Total: ${booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      booking.status === 'CheckedIn' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      booking.status === 'CheckedOut' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {booking.status}
                    </span>

                    {booking.status !== 'Cancelled' && (
                        <a 
                          href={`/invoice/${booking._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                           <FileText size={18} />
                        </a>
                    )}
                  </div>

                  {booking.status === 'Confirmed' && (
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center gap-1 font-medium transition-colors"
                    >
                      <XCircle size={16} /> Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">You don't have any bookings yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-white">My Events</h2>
            <div className="grid gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{event.eventType} Event</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                         <span>Guests: {event.guests}</span>
                         <span>Est. Cost: ${event.cost || 0} {event.discount > 0 && <span className="text-xs text-green-600">({event.discount}% Off)</span>}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        event.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        event.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        event.status === 'Completed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {event.status}
                      </span>

                      {/* Event Invoice Link */}
                      {event.cost > 0 && (
                          <a 
                            href={`/invoice/${event._id}?type=event`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="View Event Invoice"
                          >
                             <FileText size={18} />
                          </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

       {/* Confirmation Modal */}
       <ConfirmationModal 
           isOpen={confirmation.isOpen}
           onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
           onConfirm={confirmation.onConfirm}
           title={confirmation.title}
           message={confirmation.message}
           type={confirmation.type}
           confirmText={confirmation.confirmText}
       />
    </div>
  );
};

export default MyBookings;
