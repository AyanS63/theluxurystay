import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Loader, ArrowLeft, Printer, MapPin, Mail, Phone } from 'lucide-react';

const Invoice = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'booking'; // 'booking' or 'event'
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PRICING = {
    'Wedding': { base: 5000, guest: 50 },
    'Corporate': { base: 2000, guest: 35 },
    'Social': { base: 1000, guest: 30 },
    'Other': { base: 1000, guest: 25 }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = type === 'event' ? `/events/${id}` : `/bookings/${id}`;
        const res = await api.get(endpoint);
        setData(res.data);
      } catch (err) {
        setError('Failed to load invoice details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-primary-600" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Invoice not found.</div>;

  // Calculation Logic
  let invoiceDetails = {};
  
  if (type === 'booking') {
      const nights = Math.ceil((new Date(data.checkOutDate) - new Date(data.checkInDate)) / (1000 * 60 * 60 * 24));
      const roomTotal = data.room.pricePerNight * nights;
      const extrasTotal = data.extras ? data.extras.reduce((sum, item) => sum + item.price, 0) : 0;
      
      invoiceDetails = {
          billedToName: data.user.username,
          billedToEmail: data.user.email,
          detailsTitle: 'Stay Details',
          details: [
              { label: 'Check In', value: new Date(data.checkInDate).toLocaleDateString() },
              { label: 'Check Out', value: new Date(data.checkOutDate).toLocaleDateString() },
              { label: 'Duration', value: `${nights} Nights` }
          ],
          items: [
              {
                  desc: `Room ${data.room.roomNumber} (${data.room.type})`,
                  price: data.room.pricePerNight,
                  qty: nights,
                  total: roomTotal
              },
              ...(data.extras || []).map(extra => ({
                  desc: extra.name,
                  price: extra.price,
                  qty: 1,
                  total: extra.price
              }))
          ],
          subtotal: roomTotal + extrasTotal,
          total: data.totalAmount
      };
  } else {
      // Event Logic
      const basePrice = PRICING[data.eventType]?.base || 0;
      const guestRate = PRICING[data.eventType]?.guest || 0;
      const guestTotal = data.guests * guestRate;
      
      invoiceDetails = {
          billedToName: data.contactInfo.name,
          billedToEmail: data.contactInfo.email,
          detailsTitle: 'Event Details',
          details: [
              { label: 'Event Type', value: data.eventType },
              { label: 'Date', value: new Date(data.date).toLocaleDateString() },
              { label: 'Guests', value: `${data.guests} People` }
          ],
          items: [
              {
                  desc: `Base Package: ${data.eventType}`,
                  price: basePrice,
                  qty: 1,
                  total: basePrice
              },
              {
                  desc: `Guest Charge`,
                  price: guestRate,
                  qty: data.guests,
                  total: guestTotal
              }
          ],
          subtotal: basePrice + guestTotal,
          total: data.cost || (basePrice + guestTotal)
      };
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden print:shadow-none print:dark:bg-white print:dark:text-black">
        
        {/* Toolbar - Hidden in Print */}
        <div className="p-6 bg-slate-100 dark:bg-slate-700/50 flex justify-between items-center print:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Printer size={20} /> Print Invoice
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-4 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-12 border-b border-slate-100 pb-6 md:pb-12">
             <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary-700 dark:text-primary-600 mb-1 md:mb-2">LuxuryStay</h1>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] md:text-xs font-bold">Premium Hotel Management</p>
             </div>
             <div className="text-left md:text-right w-full md:w-auto">
                <h2 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 print:text-black mb-1">INVOICE</h2>
                <p className="text-slate-500 text-sm md:text-base">#{data._id.slice(-8).toUpperCase()}</p>
                <div className="mt-3 md:mt-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 print:text-black space-y-1">
                   <p className="flex items-center md:justify-end gap-2"><MapPin size={12} className="md:w-3.5 md:h-3.5" /> 123 Luxury Ave, Paradise City</p>
                   <p className="flex items-center md:justify-end gap-2"><Phone size={12} className="md:w-3.5 md:h-3.5" /> +1 (555) 123-4567</p>
                   <p className="flex items-center md:justify-end gap-2"><Mail size={12} className="md:w-3.5 md:h-3.5" /> billing@luxurystay.com</p>
                </div>
             </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-12">
             <div>
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 md:mb-3">Billed To</h3>
                <h4 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-200 print:text-black">{invoiceDetails.billedToName}</h4>
                <p className="text-slate-600 dark:text-slate-400 print:text-black text-sm md:text-base">{invoiceDetails.billedToEmail}</p>
             </div>
             <div className="text-left md:text-right">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 md:mb-3">{invoiceDetails.detailsTitle}</h3>
                {invoiceDetails.details.map((detail, idx) => (
                    <p key={idx} className="text-slate-700 dark:text-slate-300 print:text-black font-medium text-sm md:text-base">
                        <span className="text-slate-400 font-normal">{detail.label}:</span> {detail.value}
                    </p>
                ))}
             </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6 md:mb-12 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-left min-w-[500px] md:min-w-full text-sm md:text-base">
               <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-[10px] md:text-xs font-bold">
                  <tr>
                     <th className="py-3 px-3 md:py-4 md:px-4 rounded-l-lg">Description</th>
                     <th className="py-3 px-3 md:py-4 md:px-4 text-right">Price</th>
                     <th className="py-3 px-3 md:py-4 md:px-4 text-right">Qty</th>
                     <th className="py-3 px-3 md:py-4 md:px-4 rounded-r-lg text-right">Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invoiceDetails.items.map((item, idx) => (
                     <tr key={idx}>
                        <td className="py-3 px-3 md:py-4 md:px-4 font-medium text-slate-700 dark:text-slate-300 print:text-black">
                           {item.desc}
                        </td>
                        <td className="py-3 px-3 md:py-4 md:px-4 text-right text-slate-600 dark:text-slate-400 print:text-black">${item.price.toLocaleString()}</td>
                        <td className="py-3 px-3 md:py-4 md:px-4 text-right text-slate-600 dark:text-slate-400 print:text-black">{item.qty}</td>
                        <td className="py-3 px-3 md:py-4 md:px-4 text-right font-bold text-slate-800 dark:text-slate-200 print:text-black">${item.total.toLocaleString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-slate-100 dark:border-slate-700 pt-6 md:pt-8">
             <div className="flex flex-col md:flex-row justify-end">
                <div className="w-full md:w-1/2 space-y-2 md:space-y-3">
                   <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black text-sm md:text-base">
                      <span>Subtotal</span>
                      <span>${invoiceDetails.subtotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black text-sm md:text-base">
                      <span>Taxes (0%)</span>
                      <span>$0.00</span>
                   </div>
                   <div className="flex justify-between text-lg md:text-2xl font-bold text-primary-700 dark:text-primary-400 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-700 print:text-black">
                      <span>Total Amount</span>
                      <span>${invoiceDetails.total.toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-slate-400 text-sm print:mt-8">
             <p>Thank you for choosing LuxuryStay. We hope to see you again soon!</p>
             <p className="mt-2 text-xs">This is a computer generated invoice and does not require a signature.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Invoice;
