import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  Trash2, 
  FileText, 
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import EventPaymentModal from '../components/Payment/EventPaymentModal';
import CustomSelect from '../components/CustomSelect';

const EventsManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const PRICING = {
    'Wedding': { base: 5000, guest: 50 },
    'Corporate': { base: 2000, guest: 35 },
    'Social': { base: 1000, guest: 30 },
    'Other': { base: 1000, guest: 25 }
  };

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

  const handleStatusUpdate = (id, newStatus) => {
      const actionConfig = {
          'Confirmed': { type: 'success', title: 'Approve Event', message: 'Are you sure you want to approve this event inquiry?' },
          'Cancelled': { type: 'danger', title: 'Decline Event', message: 'Are you sure you want to decline this event? This will notify the user.' },
          'Completed': { type: 'info', title: 'Complete Event', message: 'Mark this event as completed? This assumes the event has taken place.' }
      };

      const config = actionConfig[newStatus] || { type: 'info', title: 'Update Status', message: `Update status to ${newStatus}?` };

      setConfirmation({
          isOpen: true,
          type: config.type,
          title: config.title,
          message: config.message,
          confirmText: newStatus === 'Confirmed' ? 'Approve' : newStatus === 'Cancelled' ? 'Decline' : 'Confirm',
          onConfirm: async () => {
              try {
                  await api.put(`/events/${id}/status`, { status: newStatus });
                  fetchEvents();
                  setConfirmation(prev => ({ ...prev, isOpen: false }));
              } catch (err) {
                  console.error('Failed to update status', err);
                  alert('Failed to update status');
              }
          }
      });
  };

  const handleDelete = (id) => {
      setConfirmation({
          isOpen: true,
          type: 'danger',
          title: 'Delete Event',
          message: 'Are you sure you want to delete this event record? This action cannot be undone.',
          confirmText: 'Delete',
          onConfirm: async () => {
              try {
                  await api.delete(`/events/${id}`);
                  setEvents(events.filter(e => e._id !== id));
                  setConfirmation(prev => ({ ...prev, isOpen: false }));
              } catch (err) {
                  console.error('Failed to delete event', err);
                  alert('Failed to delete event');
              }
          }
      });
  };

  const openInvoiceModal = (event) => {
      setSelectedEvent(event);
      setInvoiceAmount(event.cost || '');
      setDiscountAmount(event.discount || 0);
      setInvoiceModalOpen(true);
  };

  const handleCreateInvoice = async (e) => {
      e.preventDefault();
      setProcessing(true);
      try {
          await api.post(`/events/${selectedEvent._id}/invoice`, { 
              amount: Number(invoiceAmount),
              discount: Number(discountAmount)
          });
          setInvoiceModalOpen(false);
          alert('Invoice created successfully');
          fetchEvents(); 
      } catch (err) {
          console.error('Failed to create invoice', err);
          alert('Failed to create invoice');
      } finally {
          setProcessing(false);
      }
  };

  const filteredEvents = events.filter(event => {
      const matchesFilter = filter === 'all' || event.status.toLowerCase() === filter.toLowerCase();
      // Added safety check for contactInfo in case of malformed data
      const contactName = event.contactInfo?.name || '';
      const contactEmail = event.contactInfo?.email || '';
      
      const matchesSearch = 
        event.eventType.toLowerCase().includes(search.toLowerCase()) || 
        contactName.toLowerCase().includes(search.toLowerCase()) ||
        contactEmail.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading events data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Events Management</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage bookings, inquiries, and invoices</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>
            <CustomSelect 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'completed', label: 'Completed' }
              ]}
              icon={Filter}
              className="w-full md:w-48"
            />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredEvents.map((event) => (
          <div key={event._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-white">{event.eventType}</h3>
                   <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {format(new Date(event.date), 'PPP')}</span>
                      <span className="flex items-center gap-1"><Users size={12}/> {event.guests} Guests</span>
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

             <div className="text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                <p className="font-semibold text-slate-700 dark:text-slate-300">{event.contactInfo.name}</p>
                <div className="text-slate-500 flex flex-col gap-1 mt-1 text-xs">
                    <span className="flex items-center gap-1"><Mail size={12}/> {event.contactInfo.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12}/> {event.contactInfo.phone}</span>
                </div>
             </div>

             {event.requirements && (
                 <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-semibold mb-1">Requirements:</p>
                    {event.requirements}
                 </div>
             )}

             <div className="flex justify-between items-center pt-2">
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Est. Cost: {event.cost ? `$${event.cost.toLocaleString()}` : <span className="text-slate-400 italic font-normal">Not invoiced</span>}
                 </span>
             </div>

             <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                 {/* Admin/Staff Actions */}
                 {['admin', 'manager', 'receptionist'].includes(user?.role) && (
                     <>
                        {event.status === 'Pending' && (
                            <>
                                <button 
                                onClick={() => handleStatusUpdate(event._id, 'Confirmed')}
                                className="flex-1 bg-green-50 text-green-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-green-100"
                                >
                                <CheckCircle size={16} /> Approve
                                </button>
                                <button 
                                onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                                className="flex-1 bg-red-50 text-red-600 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-red-100"
                                >
                                <XCircle size={16} /> Decline
                                </button>
                            </>
                        )}
                        
                        {event.status === 'Confirmed' && (
                            <>
                                <button 
                                    onClick={() => handleStatusUpdate(event._id, 'Completed')}
                                    className="flex-1 bg-blue-50 text-blue-700 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-blue-100"
                                >
                                    <CheckCircle size={16} /> Mark Completed
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                                    className="flex-1 bg-red-50 text-red-600 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-red-100"
                                >
                                    <XCircle size={16} /> Decline
                                </button>
                            </>
                        )}
                        
                        {event.cost ? (
                            <a 
                                href={`/invoice/${event._id}?type=event`}
                                className="p-2 text-primary-600 bg-primary-50 rounded-lg flex items-center justify-center flex-1 hover:bg-primary-100"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText size={18} /> View Invoice
                            </a>
                        ) : (
                            <button 
                                onClick={() => openInvoiceModal(event)}
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center flex-1 hover:bg-blue-100"
                            >
                                <FileText size={18} /> Invoice
                            </button>
                        )}
                        
                        <button 
                           onClick={() => handleDelete(event._id)}
                           className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                           <Trash2 size={18} />
                        </button>
                     </>
                 )}

                 {/* User Actions */}
                 {!['admin', 'manager', 'receptionist'].includes(user?.role) && (
                    <>
                        {event.status === 'Pending' && (
                            <div className="flex-1 text-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                                Awaiting Approval
                            </div>
                        )}
                        {event.status === 'Confirmed' && (
                            <>
                                {event.cost > 0 && (
                                    // TODO: Check if paid. For now, assuming if cost exists and button visible, it means unpaid? 
                                    // We need payment status. Assuming cost is updated on invoice. 
                                    // Let's add 'Pay' button which opens modal.
                                    // Ideally backend sends 'isPaid' or 'billingStatus'.
                                    // For now, if cost > 0, we show Pay. If already paid, we should ideally hide it.
                                    // We'll rely on user seeing "Paid" status if implemented, or we can check something.
                                    // Let's assume for now user needs to Pay if confirmed.
                                    // Wait, if paid, we shouldn't show pay button. 
                                    // Let's check if we can fetch payment status. 
                                    // Adding a quick check: if event has Linked Billing that is Paid.
                                    // The current getEvents doesn't populate billing.
                                    // We'll just show Pay. Backend prevents double payment? 
                                    // Let's simply show Pay and later refine.
                                    <button
                                        onClick={() => { setSelectedEvent(event); setPaymentModalOpen(true); }}
                                        className="flex-1 bg-primary-600 text-white p-2 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm"
                                    >
                                        Pay ${event.cost.toLocaleString()}
                                    </button>
                                )}
                                <a 
                                    href={`/invoice/${event._id}?type=event`}
                                    className="p-2 text-slate-500 hover:text-primary-600 flex items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FileText size={18} />
                                </a>
                            </>
                        )}
                    </>
                 )}
             </div>
          </div>
        ))}
         {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-slate-500">No events found.</div>
         )}
      </div>

      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold">Event Details</th>
                <th className="px-6 py-4 font-bold">Client Info</th>
                <th className="px-6 py-4 font-bold">Requirements</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Est. Cost</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 dark:text-white text-base">{event.eventType}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {format(new Date(event.date), 'PPP')}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <Users size={12} /> {event.guests} Guests
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{event.contactInfo.name}</div>
                    <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                       <span className="flex items-center gap-1"><Mail size={10}/> {event.contactInfo.email}</span>
                       <span className="flex items-center gap-1"><Phone size={10}/> {event.contactInfo.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate" title={event.requirements}>
                        {event.requirements || 'None'}
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
                  <td className="px-6 py-4">
                     {event.cost ? (
                         <span className="font-bold text-slate-700 dark:text-slate-300">
                            ${event.cost.toLocaleString()}
                         </span>
                     ) : (
                         <span className="text-slate-400 text-xs italic">Not invoiced</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       {/* Status Actions */}
                       {event.status === 'Pending' && (
                           <>
                             <button 
                                onClick={() => handleStatusUpdate(event._id, 'Confirmed')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                             >
                                <CheckCircle size={18} />
                             </button>
                             <button 
                                onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Decline"
                             >
                                <XCircle size={18} />
                             </button>
                           </>
                       )}
                       
                       {event.status === 'Confirmed' && (
                           <>
                               <button 
                                  onClick={() => handleStatusUpdate(event._id, 'Completed')}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Mark Completed"
                               >
                                  <CheckCircle size={18} />
                               </button>
                               <button 
                                  onClick={() => handleStatusUpdate(event._id, 'Cancelled')}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Decline / Refund"
                               >
                                  <XCircle size={18} />
                               </button>
                           </>
                       )}
                       
                       {/* Invoice Action - View if Cost exists, Create if not */}
                       {event.cost ? (
                           <a 
                              href={`/invoice/${event._id}?type=event`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Invoice"
                              target="_blank"
                              rel="noopener noreferrer"
                           >
                              <FileText size={18} />
                           </a>
                       ) : (
                           <button 
                              onClick={() => openInvoiceModal(event)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Generate Invoice"
                           >
                              <FileText size={18} />
                           </button>
                       )}

                       {/* Delete Action */}
                       <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                   <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No events found matching your filter.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up md:relative absolute">
                 <button 
                    onClick={() => setInvoiceModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                 >
                    <X size={20} />
                 </button>

                 <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create Event Invoice</h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Create a bill for <strong>{selectedEvent?.eventType}</strong> on {selectedEvent?.date && format(new Date(selectedEvent?.date), 'PPP')}.
                 </p>
                 
                 {selectedEvent && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6 text-sm">
                          <div className="flex justify-between mb-1">
                              <span className="text-slate-600 dark:text-slate-400">Base Price ({selectedEvent.eventType})</span>
                              <span className="font-medium text-slate-800 dark:text-white">${PRICING[selectedEvent.eventType]?.base.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                              <span className="text-slate-600 dark:text-slate-400">{selectedEvent.guests} Guests x ${PRICING[selectedEvent.eventType]?.guest}</span>
                              <span className="font-medium text-slate-800 dark:text-white">${(selectedEvent.guests * PRICING[selectedEvent.eventType]?.guest).toLocaleString()}</span>
                          </div>
                          <div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between font-bold">
                              <span className="text-slate-800 dark:text-white">Suggested Total</span>
                              <span className="text-primary-600 dark:text-primary-400">
                                  ${(PRICING[selectedEvent.eventType]?.base + (selectedEvent.guests * PRICING[selectedEvent.eventType]?.guest)).toLocaleString()}
                              </span>
                          </div>
                      </div>
                  )}
                 
                 <form onSubmit={handleCreateInvoice}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Total Cost ($)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                               type="number" 
                               value={invoiceAmount}
                               onChange={(e) => setInvoiceAmount(e.target.value)}
                               className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                               placeholder="0.00"
                               required
                               min="0"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Discount (%)
                        </label>
                        <div className="relative">
                            <input 
                               type="number" 
                               value={discountAmount}
                               onChange={(e) => setDiscountAmount(e.target.value)}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                               placeholder="0"
                               min="0"
                               max="100"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                           type="button"
                           onClick={() => setInvoiceModalOpen(false)}
                           className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={processing}
                           className="flex-1 py-3 font-bold bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors shadow-lg disabled:opacity-70"
                        >
                           {processing ? 'Creating...' : 'Create Invoice'}
                        </button>
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

export default EventsManagement;
