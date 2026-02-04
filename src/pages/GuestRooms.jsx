import React, { useState, useEffect } from 'react';
import { AVAILABLE_EXTRAS } from '../utils/constants';
import api from '../utils/api';
import { Loader, Users, Check, X, XCircle } from 'lucide-react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/Payment/CheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

const GuestRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    specialRequests: ''
  });
  
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment State
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isPaymentStep, setIsPaymentStep] = useState(false);

  const [unavailableDates, setUnavailableDates] = useState([]);

  // Calculate total price live
  useEffect(() => {
    if (selectedRoom && formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const price = selectedRoom.discount > 0 
            ? Math.round(selectedRoom.pricePerNight * (1 - selectedRoom.discount / 100)) 
            : selectedRoom.pricePerNight;
        const roomTotal = price * nights;
        const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
        setTotalPrice(roomTotal + extrasTotal);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [formData.checkInDate, formData.checkOutDate, selectedRoom, selectedExtras]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          api.get('/rooms'),
          user ? api.get('/bookings') : Promise.resolve({ data: [] })
        ]);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setUserBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const isRoomBooked = (roomId) => {
    return userBookings.some(booking => 
      booking.room &&
      booking.room._id === roomId && 
      ['Pending', 'Confirmed', 'CheckedIn'].includes(booking.status)
    );
  };

  const handleViewDetails = (room) => {
    navigate(`/rooms/${room._id}`);
  };

  const handleBookClick = async (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isRoomBooked(room._id)) return;
    
    setSelectedRoom(room);
    setFormData({
      checkInDate: '',
      checkOutDate: '',
      guests: 1,
      specialRequests: ''
    });
    setSelectedExtras([]);
    setError('');
    setSuccess('');
    setIsPaymentStep(false);
    setClientSecret('');
    setIsModalOpen(true);

    // Fetch unavailable dates
    try {
        const res = await api.get(`/bookings/unavailable/${room._id}`);
        setUnavailableDates(res.data);
    } catch (e) {
        console.error("Failed to fetch unavailable dates", e);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Live validation
    if (e.target.name === 'checkInDate' || e.target.name === 'checkOutDate') {
        const checkIn = e.target.name === 'checkInDate' ? e.target.value : formData.checkInDate;
        const checkOut = e.target.name === 'checkOutDate' ? e.target.value : formData.checkOutDate;
        
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            
            // Check for overlap
            const isOverlapping = unavailableDates.some(booking => {
                const bookedStart = new Date(booking.checkInDate);
                const bookedEnd = new Date(booking.checkOutDate);
                
                // Reset times
                start.setHours(0,0,0,0);
                end.setHours(0,0,0,0);
                bookedStart.setHours(0,0,0,0);
                bookedEnd.setHours(0,0,0,0);

                return (start < bookedEnd && end > bookedStart);
            });

            if (isOverlapping) {
                setError('Selected dates are not available.');
            } else {
                setError('');
            }
        }
    }
  };
  
  const handleExtraChange = (extra) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  // Step 1: Create Payment Intent
  const initiatePayment = async (e) => {
    e.preventDefault();
    if (error) return; // Prevent submission if error
    setError('');
    
    try {
        const res = await api.post('/bookings/create-payment-intent', {
            room: selectedRoom._id,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            extras: selectedExtras
        });

        setClientSecret(res.data.clientSecret);
        setPaymentAmount(res.data.totalAmount);
        setIsPaymentStep(true);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  // Step 2: Confirm Booking after Payment
  const handlePaymentSuccess = async (paymentIntentId) => {
    setError('');
    setSuccess('');
    
    try {
      const res = await api.post('/bookings', {
        room: selectedRoom._id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        extras: selectedExtras,
        paymentIntentId: paymentIntentId
      });
      setSuccess('Booking confirmed & paid successfully!');
      
      // Update local bookings state
      setUserBookings([...userBookings, res.data.booking]);
      
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment successful but booking creation failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen">
       <GuestNavbar />
       <div className="p-6 flex justify-center mt-20"><Loader className="animate-spin text-primary-600" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <GuestNavbar />
      
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
        <div className="relative z-10 text-center px-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Our Accommodations</h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto font-light">
                Choose from our selection of premium rooms and suites, designed for your ultimate comfort and relaxation.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const isBooked = isRoomBooked(room._id);
            return (
              <div key={room._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col">
                 <div className="h-64 bg-slate-200 dark:bg-slate-700 relative overflow-hidden group">
                    {room.images && room.images.length > 0 ? (
                       <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                       <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop" alt="Room Placeholder" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )
                     }
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white shadow-sm">
                       {room.type}
                    </div>
                 </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-serif">Room {room.roomNumber}</h3>
                     <div className="text-right">
                        {room.discount > 0 ? (
                            <>
                                <span className="text-sm text-slate-400 line-through mr-2">${room.pricePerNight}</span>
                                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    ${Math.round(room.pricePerNight * (1 - room.discount / 100))}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${room.pricePerNight}</span>
                        )}
                        <span className="text-slate-400 dark:text-slate-500 text-sm block">/ night</span>
                     </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 flex-1">{room.description}</p>
                  
                  <div className="flex items-center gap-4 mb-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                     <span className="flex items-center gap-1"><Users size={16} /> Up to 2 Guests</span>
                     <span className="flex items-center gap-1"><Check size={16} /> Free Wifi</span>
                  </div>

                  <div className="mt-auto">
                     <button 
                       onClick={() => handleViewDetails(room)}
                       className="w-full mb-3 py-3 rounded-xl font-bold text-lg border-2 border-slate-200 text-slate-600 hover:border-primary-600 hover:text-primary-600 transition-all"
                     >
                       View Details
                     </button>
                     <button 
                       onClick={() => !isBooked && handleBookClick(room)}
                       disabled={isBooked || ['Maintenance', 'Cleaning'].includes(room.status)}
                       className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                         isBooked || ['Maintenance', 'Cleaning'].includes(room.status)
                           ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                           : 'btn-primary hover:shadow-primary-600/30'
                       }`}
                     >
                       {isBooked ? 'Booked' : ['Maintenance', 'Cleaning'].includes(room.status) ? 'Unavailable' : 'Book Now'}
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!loading && rooms.length === 0 && (
            <div className="text-center py-20">
                <p className="text-2xl text-slate-400 font-serif italic mb-4">No rooms available at the moment.</p>
                <button onClick={() => window.location.reload()} className="text-primary-600 hover:underline">Refresh Page</button>
            </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-2">Book Room {selectedRoom?.roomNumber}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
                {selectedRoom?.discount > 0 ? (
                    <>
                        <span className="line-through text-slate-400 text-sm mr-2">${selectedRoom?.pricePerNight}</span>
                        <span className="text-red-600 font-bold">${Math.round(selectedRoom?.pricePerNight * (1 - selectedRoom?.discount / 100))}</span>
                    </>
                ) : (
                    <span>${selectedRoom?.pricePerNight}</span>
                )} / night • {selectedRoom?.type}
            </p>

            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"><XCircle size={18} /> {error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"><Check size={18} /> {success}</div>}

            {!success && !isPaymentStep && (
              <form onSubmit={initiatePayment} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Check In</label>
                    <DatePicker
                        selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                        onChange={(date) => {
                            setFormData(prev => ({ ...prev, checkInDate: formatDate(date) }));
                            setError('');
                        }}
                        minDate={new Date()}
                        excludeDateIntervals={unavailableDates.map(b => ({
                            start: new Date(b.checkInDate),
                            end: new Date(new Date(b.checkOutDate).getTime() - 86400000) 
                        }))}
                        placeholderText="Select Check-in"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all font-medium text-slate-800 dark:text-white input-field"
                        wrapperClassName="w-full"
                        dateFormat="MMM d, yyyy"
                        required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Check Out</label>
                     <DatePicker
                        selected={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                        onChange={(date) => {
                            setFormData(prev => ({ ...prev, checkOutDate: formatDate(date) }));
                            setError('');
                        }}
                        minDate={formData.checkInDate ? new Date(new Date(formData.checkInDate).getTime() + 86400000) : new Date()}
                        excludeDateIntervals={unavailableDates.map(b => ({
                            start: new Date(b.checkInDate),
                            end: new Date(new Date(b.checkOutDate).getTime() - 86400000)
                        }))}
                        placeholderText="Select Check-out"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all font-medium text-slate-800 dark:text-white input-field"
                        wrapperClassName="w-full"
                        dateFormat="MMM d, yyyy"
                        required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Guests</label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all font-medium text-slate-800 dark:text-white"
                    min="1"
                    max="5"
                    required
                  />
                </div>

                 <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any preferences or needs?"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all font-medium text-slate-800 dark:text-white min-h-[100px]"
                  ></textarea>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Enhance Your Stay</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_EXTRAS.map((extra) => (
                        <div key={extra.name} 
                           className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                             selectedExtras.some(e => e.name === extra.name) 
                               ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
                               : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                           }`}
                           onClick={() => handleExtraChange(extra)}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                   selectedExtras.some(e => e.name === extra.name)
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700'
                                }`}>
                                   {selectedExtras.some(e => e.name === extra.name) && <Check size={12} strokeWidth={3} />}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{extra.name}</span>
                            </div>
                            <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">+${extra.price}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Total Price:</span>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">${totalPrice}</span>
                </div>

                <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl mt-2">
                  Proceed to Payment
                </button>
              </form>
            )}

            {isPaymentStep && clientSecret && (
                <div className="animate-fade-in-up">
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Total to Pay</span>
                            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">${paymentAmount}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Secure payment powered by Stripe</p>
                    </div>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm 
                            amount={paymentAmount} 
                            onSuccess={handlePaymentSuccess} 
                            onCancel={() => setIsPaymentStep(false)}
                        />
                    </Elements>
                </div>
            )}
          </div>
        </div>
      )}
      
      <GuestFooter />
      
    </div>
  );
};

export default GuestRooms;
