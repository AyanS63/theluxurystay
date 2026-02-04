import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Loader, X, CheckCircle, LogOut, Trash2, XCircle, FileText, Bed, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomSelect from '../components/CustomSelect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper to format date as YYYY-MM-DD in local time
const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: () => {}
  });
  
  const [formData, setFormData] = useState({
    userId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    specialRequests: ''
  });

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes, usersRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms'),
        api.get('/users')
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bookings', {
        room: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: formData.guests,
        specialRequests: formData.specialRequests
      });
      setIsModalOpen(false);
      fetchData();
      setFormData({ userId: '', roomId: '', checkInDate: '', checkOutDate: '', guests: 1, specialRequests: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleDelete = (id) => {
      setConfirmation({
          isOpen: true,
          type: 'danger',
          title: 'Delete Booking',
          message: 'Are you sure you want to delete this booking record? This action cannot be undone.',
          confirmText: 'Delete',
          onConfirm: async () => {
              try {
                  await api.delete(`/bookings/${id}`);
                  fetchData();
                  setConfirmation(prev => ({ ...prev, isOpen: false }));
              } catch (err) {
                  console.error('Failed to delete booking', err);
                  alert('Failed to delete booking');
              }
          }
      });
  };

  const handleStatusUpdate = (id, newStatus) => {
      const statusConfig = {
          'Confirmed': { type: 'success', title: 'Approve Booking', message: 'Confirm this booking request?' },
          'Rejected': { type: 'danger', title: 'Reject Booking', message: 'Reject this booking request? User will be notified.' },
          'CheckedIn': { type: 'success', title: 'Check In Guest', message: 'Mark guest as Checked In?' },
          'CheckedOut': { type: 'info', title: 'Check Out Guest', message: 'Mark guest as Checked Out? Ensure payments are settled.' },
          'Cancelled': { type: 'danger', title: 'Cancel Booking', message: 'Cancel this confirmed booking?' }
      };

      const config = statusConfig[newStatus] || { type: 'info', title: 'Update Status', message: `Update booking status to ${newStatus}?` };

      setConfirmation({
          isOpen: true,
          type: config.type,
          title: config.title,
          message: config.message,
          confirmText: newStatus === 'Confirmed' ? 'Approve' : newStatus === 'Rejected' ? 'Reject' : 'Confirm',
          onConfirm: async () => {
              try {
                  await api.put(`/bookings/${id}/status`, { status: newStatus });
                  fetchData();
                  setConfirmation(prev => ({ ...prev, isOpen: false }));
              } catch (err) {
                  console.error('Failed to update status', err);
                  alert('Failed to update status');
              }
          }
      });
  };

  if (loading) return <div className="p-6"><Loader className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Bookings</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> New Reservation
        </button>
      </div>



      {/* Search Filter */}
      <div className="mb-4">
        <input 
           type="text" 
           placeholder="Search bookings by guest name or room..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="input-field max-w-md"
        />
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {bookings.filter(b => 
            (b.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.room?.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).map((booking) => (
          <div key={booking._id} className="card p-4 space-y-4">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1">{booking.user?.username || 'Unknown'}</h3>
                  <div className="text-xs text-slate-500 flex flex-col gap-1">
                    <span>Room {booking.room?.roomNumber} ({booking.room?.type})</span>
                    <span>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                  </div>
               </div>
               <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    booking.status === 'CheckedIn' ? 'bg-green-50 text-green-700 border-green-100' :
                    booking.status === 'CheckedOut' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {booking.status}
               </span>
            </div>
            {booking.extras && booking.extras.length > 0 && (
                 <div className="text-xs bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Extras:</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.extras.map((ex, i) => (
                        <span key={i} className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-600">{ex.name} (+${ex.price})</span>
                      ))}
                    </div>
                 </div>
            )}
            <div className="text-sm font-bold text-slate-800 dark:text-white">
                Total Amount: ${booking.totalAmount}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
               {booking.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                        className="flex-1 bg-green-50 text-green-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1" 
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Rejected')}
                        className="flex-1 bg-red-50 text-red-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1" 
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'Confirmed' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'CheckedIn')}
                        className="flex-1 bg-green-50 text-green-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1" 
                      >
                        <CheckCircle size={16} /> Check In
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                        className="flex-1 bg-amber-50 text-amber-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1" 
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'CheckedIn' && (
                    <button 
                      onClick={() => handleStatusUpdate(booking._id, 'CheckedOut')}
                      className="flex-1 bg-slate-100 text-slate-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1" 
                      title="Check Out"
                    >
                      <LogOut size={16} /> Check Out
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(booking._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-auto" 
                    title="Delete Booking"
                  >
                    <Trash2 size={20} />
                  </button>
                  <a 
                    href={`/invoice/${booking._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    title="View Invoice"
                  >
                    <FileText size={20} />
                  </a>
            </div>
          </div>
        ))}
         {bookings.length === 0 && (
            <div className="text-center py-8 text-slate-500">No bookings found.</div>
        )}
      </div>

      <div className="hidden md:block card overflow-hidden p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="py-4 px-4 sm:px-6 font-medium">Guest</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Room</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Check-In</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Check-Out</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Status</th>
              <th className="py-4 px-4 sm:px-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((booking) => (
              <tr key={booking._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-200">
                  {booking.user?.username || 'Unknown'}
                  <div className="text-xs text-slate-500 dark:text-slate-400">{booking.user?.email}</div>
                </td>
                <td className="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-300">Room {booking.room?.roomNumber} ({booking.room?.type})</td>
                <td className="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-300">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td className="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-300">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium w-fit border ${
                      booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      booking.status === 'CheckedIn' ? 'bg-green-50 text-green-700 border-green-100' :
                      booking.status === 'CheckedOut' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                      booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Total: ${booking.totalAmount}
                    </span>
                     {booking.extras && booking.extras.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                           <p className="font-semibold text-slate-600 dark:text-slate-400">Extras:</p>
                           <ul className="list-disc list-inside">
                             {booking.extras.map((ex, i) => (
                               <li key={i}>{ex.name} (${ex.price})</li>
                             ))}
                           </ul>
                        </div>
                     )}
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 text-right flex justify-end gap-2">
                  {booking.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                        className="text-green-600 hover:bg-green-50 p-2 rounded tooltip" 
                        title="Approve Booking"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Rejected')}
                        className="text-red-500 hover:bg-red-50 p-2 rounded tooltip" 
                        title="Reject Booking"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  {booking.status === 'Confirmed' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'CheckedIn')}
                        className="text-green-600 hover:bg-green-50 p-2 rounded tooltip" 
                        title="Check In"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                        className="text-amber-600 hover:bg-amber-50 p-2 rounded tooltip" 
                        title="Cancel Booking"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  {booking.status === 'CheckedIn' && (
                    <button 
                      onClick={() => handleStatusUpdate(booking._id, 'CheckedOut')}
                      className="text-slate-600 hover:bg-slate-100 p-2 rounded tooltip" 
                      title="Check Out"
                    >
                      <LogOut size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(booking._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded tooltip" 
                    title="Delete Booking"
                  >
                    <Trash2 size={20} />
                  </button>
                  <a 
                    href={`/invoice/${booking._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:bg-primary-50 p-2 rounded tooltip"
                    title="View Invoice"
                  >
                    <FileText size={20} />
                  </a>
                </td>
              </tr>
            ))}
             {bookings.length === 0 && (
                <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">No bookings found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">New Reservation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <CustomSelect 
                  label="Room"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  options={[
                      { value: '', label: 'Select Room' },
                      ...rooms.filter(r => r.status === 'Available').map(room => ({
                          value: room._id,
                          label: `Room ${room.roomNumber} (${room.type}) - $${room.pricePerNight}`
                      }))
                  ]}
                  placeholder="Select a Room"
                  icon={Bed}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Check In</label>
                  <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <DatePicker 
                          selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                          onChange={(date) => {
                              setFormData(prev => ({ ...prev, checkInDate: formatDate(date) }));
                          }}
                          minDate={new Date()}
                          placeholderText="Select Check-In"
                          className="input-field pl-12"
                          wrapperClassName="w-full"
                          dateFormat="MMM d, yyyy"
                          required
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
                  <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <DatePicker 
                          selected={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                          onChange={(date) => {
                              setFormData(prev => ({ ...prev, checkOutDate: formatDate(date) }));
                          }}
                          minDate={formData.checkInDate ? new Date(formData.checkInDate) : new Date()}
                          placeholderText="Select Check-Out"
                          className="input-field pl-12"
                          wrapperClassName="w-full"
                          dateFormat="MMM d, yyyy"
                          required
                      />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guests</label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="input-field min-h-[80px]"
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Confirmation Modal */}
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

export default BookingManagement;
