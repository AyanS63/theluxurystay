import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Loader, CreditCard, DollarSign, FileText, Calendar } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    bookingId: ''
  });

  const fetchData = async () => {
    try {
      const [billsRes, bookingsRes] = await Promise.all([
        api.get('/billing'),
        api.get('/bookings')
      ]);
      setBills(billsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/billing', { bookingId: formData.bookingId });
      setIsModalOpen(false);
      fetchData();
      setFormData({ bookingId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill');
    }
  };

  const handleProcessPayment = async (billId) => {
    const amount = prompt('Enter payment amount:');
    if (!amount) return;
    
    try {
      await api.post(`/billing/${billId}/pay`, {
        amount: Number(amount),
        paymentMethod: 'Cash' // Simplified for demo
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) return <div className="p-6"><Loader className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Billing & Invoices</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Generate Invoice
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {bills.map((bill) => (
          <div key={bill._id} className="card p-4 space-y-4">
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-white">#{bill._id.slice(-6)}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      bill.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      bill.status === 'Partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{bill.booking?.user?.username || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">Booking: {bill.booking?._id.slice(-6)}</p>
               </div>
               <div className="text-right">
                  <p className="text-lg font-bold text-slate-800 dark:text-white">${bill.totalAmount}</p>
                  <p className="text-xs text-emerald-600 font-medium">Paid: ${bill.paidAmount}</p>
               </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                 {bill.status !== 'Paid' && (
                  <button 
                     onClick={() => handleProcessPayment(bill._id)}
                     className="flex-1 bg-primary-50 text-primary-700 hover:bg-primary-100 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                   >
                     <CreditCard size={16} /> Process Payment
                   </button>
                 )}
                 {bill.booking && (
                   <a 
                     href={`/invoice/${bill.booking._id}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                   >
                     <FileText size={16} /> View Invoice
                   </a>
                 )}
            </div>
          </div>
        ))}
         {bills.length === 0 && (
            <div className="text-center py-8 text-slate-500">No invoices found.</div>
        )}
      </div>

      <div className="hidden md:block card overflow-hidden p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="py-4 px-4 sm:px-6 font-medium">Invoice ID</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Guest</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Total Amount</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Paid</th>
              <th className="py-4 px-4 sm:px-6 font-medium">Status</th>
              <th className="py-4 px-4 sm:px-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bills.map((bill) => (
              <tr key={bill._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-400 font-mono">#{bill._id.slice(-6)}</td>
                <td className="py-4 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-200">
                  {bill.booking?.user?.username || 'Unknown'}
                  <div className="text-xs text-slate-500 dark:text-slate-500">Booking: {bill.booking?._id.slice(-6)}</div>
                </td>
                <td className="py-4 px-4 sm:px-6 font-bold text-slate-700 dark:text-slate-200">${bill.totalAmount}</td>
                <td className="py-4 px-4 sm:px-6 text-emerald-600">${bill.paidAmount}</td>
                <td className="py-4 px-4 sm:px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    bill.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                    bill.status === 'Partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                  <td className="py-4 px-4 sm:px-6 text-right flex items-center justify-end gap-2">
                    {bill.status !== 'Paid' && (
                      <button 
                        onClick={() => handleProcessPayment(bill._id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 p-2 hover:bg-primary-50 rounded"
                      >
                        <CreditCard size={16} /> Pay
                      </button>
                    )}
                    {bill.booking && (
                       <a 
                         href={`/invoice/${bill.booking._id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-slate-500 hover:text-primary-600 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                         title="View Invoice"
                       >
                         <FileText size={18} />
                       </a>
                    )}
                  </td>
              </tr>
            ))}
             {bills.length === 0 && (
                <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">No invoices found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Generate Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Booking</label>
                <CustomSelect
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ bookingId: e.target.value })}
                  options={[
                      { value: '', label: 'Select a booking...' },
                      ...bookings.map(booking => ({
                          value: booking._id,
                          label: `${booking.user?.username} - Room ${booking.room?.roomNumber} (${new Date(booking.checkInDate).toLocaleDateString()})`
                      }))
                  ]}
                  placeholder="Select a booking"
                  icon={Calendar}
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full btn-primary">Generate Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
