import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader, Users, Check, ArrowLeft, XCircle, X, Star, Send, Edit, Trash2, RotateCcw } from 'lucide-react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { useAuth } from '../context/AuthContext';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/Payment/CheckoutForm';

import ConfirmationModal from '../components/ConfirmationModal';
import { AVAILABLE_EXTRAS } from '../utils/constants';

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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ... (existing imports)



const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userBookings, setUserBookings] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);

  // Review Form State
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    specialRequests: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Payment State
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isPaymentStep, setIsPaymentStep] = useState(false);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: () => {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Room Data
        const roomRes = await api.get(`/rooms/${id}`);
        setRoom(roomRes.data);
        
        // Fetch Unavailable Dates
        try {
            const unavailableRes = await api.get(`/bookings/unavailable/${id}`);
            setUnavailableDates(unavailableRes.data);
        } catch (e) {
            console.error("Failed to fetch unavailable dates", e);
        }

        // Fetch Bookings (if logged in)
        if (user) {
          try {
             const bookingsRes = await api.get('/bookings');
             setUserBookings(bookingsRes.data);
          } catch (e) {
             console.error("Failed to fetch bookings", e);
          }
        }

        // Fetch Reviews (independently so it doesn't block room display)
        try {
          const reviewsRes = await api.get(`/reviews/room/${id}`);
          setReviews(reviewsRes.data);
        } catch (e) {
          console.error("Failed to fetch reviews", e);
        }

      } catch (err) {
        setError('Failed to load room details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const isRoomBooked = () => {
    if (!user || !room) return false;
    return (userBookings || []).some(booking => 
      booking &&
      booking.room && 
      booking.room._id === room._id && 
      ['Pending', 'Confirmed', 'CheckedIn'].includes(booking.status)
    );
  };

  const handleBookClick = () => {
    try { 
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (isRoomBooked()) {
            alert("You have already booked this room!");
            return;
        }

        setFormData({
          checkInDate: '',
          checkOutDate: '',
          guests: 1,
          specialRequests: ''
        });
        setBookingError('');
        setBookingSuccess('');
        setIsPaymentStep(false);
        setClientSecret('');

        setSelectedExtras([]);
        setIsModalOpen(true);
    } catch (error) {
        console.error("Booking Error:", error);
        alert("Something went wrong opening the booking form. Please refresh the page.");
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
                setBookingError('Selected dates are not available.');
            } else {
                setBookingError('');
            }
        }
    }
  };

  const handleExtraToggle = (extra) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return room?.pricePerNight || 0;
    
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return room?.pricePerNight || 0;

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return room?.pricePerNight || 0;
    
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return (room.pricePerNight * nights) + extrasTotal;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    setReviewError('');
    setReviewSuccess('');

    try {
       if (editingReviewId) {
          // Update existing review
          const res = await api.put(`/reviews/${editingReviewId}`, {
             rating: newReview.rating,
             comment: newReview.comment
          });
          
          setReviews(reviews.map(r => r._id === editingReviewId ? res.data : r));
          setReviewSuccess('Review updated successfully!');
          setEditingReviewId(null);
       } else {
          // Create new review
          const res = await api.post('/reviews', {
             room: room._id,
             rating: newReview.rating,
             comment: newReview.comment
          });
          
          setReviews([res.data.review, ...reviews]);
          setReviewSuccess('Review posted successfully!');
       }
       setNewReview({ rating: 5, comment: '' });
    } catch (err) {
       setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setNewReview({ rating: review.rating, comment: review.comment });
    setReviewSuccess('');
    setReviewError('');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setNewReview({ rating: 5, comment: '' });
    setReviewSuccess('');
    setReviewError('');
  };

  const handleDeleteClick = (reviewId) => {
    setConfirmation({
        isOpen: true,
        type: 'danger',
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review?',
        confirmText: 'Delete',
        onConfirm: async () => {
            try {
                await api.delete(`/reviews/${reviewId}`);
                setReviews(reviews.filter(r => r._id !== reviewId));
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            } catch (err) {
                console.error('Failed to delete review', err);
            }
        }
    });
  };

  // Called when user clicks "Proceed to Payment"
  const initiatePayment = async (e) => {
    e.preventDefault();
    if (bookingError) return; // Block if error
    setBookingError('');
    
    try {
        const res = await api.post('/bookings/create-payment-intent', {
            room: room._id,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            extras: selectedExtras
        });

        setClientSecret(res.data.clientSecret);
        setPaymentAmount(res.data.totalAmount);
        setIsPaymentStep(true);
    } catch (err) {
        setBookingError(err.response?.data?.message || 'Failed to initiate payment');
    }
  };
 
  // ... (handlePaymentSuccess remains same) we can start replacement from initiatePayment up to form 

  // ... (skip down to form inputs)

// Since this is a large file, I will replace the state defs + useEffect + handlers in one go, and then the form inputs in another chunk if needed, or try to match a larger block. I will try to replace from line 33 down to line 157.

  // Called by CheckoutForm when payment succeeds
  const handlePaymentSuccess = async (paymentIntentId) => {
    setBookingError('');
    setBookingSuccess('');
    
    try {
      const res = await api.post('/bookings', {
        room: room._id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: formData.guests,
        extras: selectedExtras,
        specialRequests: formData.specialRequests,
        paymentIntentId: paymentIntentId // CONFIRM PAYMENT
      });
      setBookingSuccess('Booking confirmed & paid successfully!');
      
      // Update local bookings state
      setUserBookings([...userBookings, res.data.booking]);
      
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/my-bookings');
      }, 3000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Payment succeeded but booking creation failed. Please contact support.');
    }
  };

  if (loading) return (
    <div className="min-h-screen">
       <GuestNavbar />
       <div className="p-6 flex justify-center mt-20"><Loader className="animate-spin text-primary-600" /></div>
    </div>
  );

  if (error || !room) return (
    <div className="min-h-screen">
      <GuestNavbar />
      <div className="p-12 text-center">
         <h2 className="text-2xl font-bold text-slate-800 mb-4">Room Not Found</h2>
         <button onClick={() => navigate('/rooms')} className="text-primary-600 hover:underline">Back to Rooms</button>
      </div>
    </div>
  );

  const isBooked = isRoomBooked();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <GuestNavbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate('/rooms')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Rooms
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row">
            {/* Left: Image Section */}
            <div className="w-full lg:w-1/2 h-[400px] lg:h-auto bg-slate-200 relative">
               {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                     <span className="font-serif italic text-3xl opacity-50">Room Image</span>
                  </div>
               )}
               <div className="absolute top-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white shadow-sm">
                  {room.type}
               </div>
               {room.status === 'Maintenance' && (
                 <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
                    {room.status}
                 </div>
               )}
            </div>

            {/* Right: Details Section */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
               <div className="mb-6">
                 <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-white mb-2">Room {room.roomNumber}</h1>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">${room.pricePerNight}</span>
                    <span className="text-slate-500 dark:text-slate-400">/ night</span>
                 </div>
               </div>

               <div className="prose prose-slate prose-lg mb-10 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-sm font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Description</h3>
                  <p>{room.description}</p>
               </div>

               <div className="mb-10">
                  <h3 className="text-sm font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary-600 dark:text-primary-400"><Check size={18} /></div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Free Wifi</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary-600 dark:text-primary-400"><Users size={18} /></div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Up to {room.type.includes('Suite') ? '4' : '2'} Guests</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary-600 dark:text-primary-400"><Check size={18} /></div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Smart TV</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary-600 dark:text-primary-400"><Check size={18} /></div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Room Service</span>
                     </div>
                  </div>
               </div>
               
               <div className="mt-auto pt-8 border-t border-slate-100">
                   <button 
                     onClick={handleBookClick}
                     disabled={isBooked || ['Maintenance', 'Cleaning'].includes(room.status)}
                     className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
                        isBooked || ['Maintenance', 'Cleaning'].includes(room.status)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'btn-primary hover:shadow-primary-600/30'
                     }`}
                   >
                     {isBooked ? 'You Have Booked This Room' : ['Maintenance', 'Cleaning'].includes(room.status) ? 'Currently Unavailable' : 'Book This Room'}
                   </button>
                  {isBooked && (
                    <p className="text-center text-slate-500 text-sm mt-3 font-medium">You have an active booking for this room.</p>
                  )}
               </div>
            </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
           <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-8">Guest Reviews</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Review Form */}
              <div className="md:col-span-1">
                 <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Write a Review</h3>
                    {!user ? (
                      <p className="text-slate-500 text-sm">Please <button onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:underline">log in</button> to leave a review.</p>
                    ) : (
                      <form onSubmit={handleReviewSubmit}>
                         <div className="mb-4">
                            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Rating</label>
                            <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map((star) => (
                                 <button 
                                   key={star}
                                   type="button"
                                   onClick={() => setNewReview({...newReview, rating: star})}
                                   className={`p-1 transition-transform hover:scale-110 ${newReview.rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                                 >
                                   <Star fill={newReview.rating >= star ? "currentColor" : "none"} size={24} />
                                 </button>
                               ))}
                            </div>
                         </div>
                         
                         <div className="mb-4">
                            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Comment</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                              placeholder="Share your experience..."
                              className="w-full p-3 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                              rows="4"
                              required
                            ></textarea>
                         </div>

                         {reviewError && <p className="text-red-500 text-xs mb-3">{reviewError}</p>}
                         {reviewSuccess && <p className="text-green-500 text-xs mb-3">{reviewSuccess}</p>}

                         <div className="flex gap-2">
                           <button type="submit" className="flex-1 btn-primary py-2 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2">
                              <Send size={16} /> {editingReviewId ? 'Update' : 'Post'}
                           </button>
                           {editingReviewId && (
                             <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors">
                                <RotateCcw size={18} />
                             </button>
                           )}
                         </div>
                      </form>
                    )}
                 </div>
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-slate-800 dark:text-white">
                       {reviews.length > 0 
                         ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                         : '0.0'}
                    </div>
                    <div>
                       <div className="flex text-yellow-400 text-sm">
                          {[1,2,3,4,5].map(i => (
                             <Star key={i} size={16} fill={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0) ? "currentColor" : "none"} />
                          ))}
                       </div>
                       <p className="text-slate-400 text-sm">{reviews.length} Verified Reviews</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {reviews.map((review) => (
                       <div key={review._id} className="border-b border-slate-50 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                   {review.user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{review.user?.username || 'Anonymous'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                {user && review.user && (user.id === review.user._id || user._id === review.user._id) && (
                                   <div className="flex gap-1 ml-2">
                                      <button onClick={() => handleEditClick(review)} className="p-1 text-slate-400 hover:text-primary-600 transition-colors" title="Edit">
                                         <Edit size={14} />
                                      </button>
                                      <button onClick={() => handleDeleteClick(review._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                         <Trash2 size={14} />
                                      </button>
                                   </div>
                                )}
                             </div>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                             {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                       </div>
                    ))}
                    {reviews.length === 0 && (
                       <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl italic">
                          No reviews yet. Be the first to share your experience!
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-2">Book Room {room.roomNumber}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">${room.pricePerNight} / night • {room.type}</p>

            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"><XCircle size={18} /> {error}</div>}
            {bookingError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"><XCircle size={18} /> {bookingError}</div>}
            {bookingSuccess && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"><Check size={18} /> {bookingSuccess}</div>}

            {!bookingSuccess && !isPaymentStep && (
              <form onSubmit={initiatePayment} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Check In</label>
                    <DatePicker
                        selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                        onChange={(date) => {
                            setFormData(prev => ({ ...prev, checkInDate: formatDate(date) }));
                            setBookingError('');
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
                            setBookingError('');
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
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Extras (Optional)</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_EXTRAS.map((extra) => (
                        <div key={extra.name} 
                             onClick={() => handleExtraToggle(extra)}
                             className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                               selectedExtras.some(e => e.name === extra.name) 
                                ? 'bg-primary-50 border-primary-500 text-primary-900 dark:bg-primary-900/20 dark:border-primary-500 dark:text-white' 
                                : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300'
                             }`}
                        >
                           <span className="text-sm font-medium">{extra.name}</span>
                           <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-400">
                             +${extra.price}
                           </span>
                        </div>
                      ))}
                   </div>
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
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                   <div className="flex justify-between items-center mb-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Total Price Estimate:</span>
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                         ${calculateTotal()}
                      </span>
                   </div>
                   <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl">
                     Proceed to Payment
                   </button>
                </div>
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

      <GuestFooter />
      
    </div>
  );
};

export default RoomDetails;
