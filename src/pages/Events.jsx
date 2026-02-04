import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { Calendar, Users, Mail, Phone, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventPaymentModal from '../components/Payment/EventPaymentModal';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from '../components/CustomSelect';

// Helper to format date as YYYY-MM-DD in local time
const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    date: '',
    guests: '',
    requirements: '',
    name: user?.username || '',
    email: user?.email || '',
    phone: ''
  });
  const [cost, setCost] = useState(0);

  const PRICING = {
    'Wedding': { base: 5000, guest: 50 },
    'Corporate': { base: 2000, guest: 35 },
    'Social': { base: 1000, guest: 30 },
    'Other': { base: 1000, guest: 25 }
  };

  useEffect(() => {
    const type = formData.eventType || 'Wedding';
    const guestCount = parseInt(formData.guests) || 0;
    const price = PRICING[type];
    
    const calculatedCost = price.base + (price.guest * guestCount);
    setCost(calculatedCost);
  }, [formData.eventType, formData.guests]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [createdEvent, setCreatedEvent] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/events', {
        eventType: formData.eventType,
        date: formData.date,
        guests: formData.guests,
        requirements: formData.requirements,
        contactInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        },
        cost: cost
      });
      setCreatedEvent(res.data.event);
      setSuccess('Your inquiry has been sent successfully! Our events team will contact you shortly.');
      setFormData({
        eventType: 'Wedding',
        date: '',
        guests: '',
        requirements: '',
        name: user?.username || '',
        email: user?.email || '',
        phone: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <GuestNavbar transparent />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-slate-900 flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <span className="text-primary-400 font-bold tracking-widest uppercase text-sm">Unforgettable Moments</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Celebrate Life's <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-primary-500">Grandest Events</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, construct the perfect backdrop for your most cherished memories with our world-class venues and services.
            </p>
            <button 
              onClick={() => document.getElementById('inquiry-form').scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary-600/30 inline-flex items-center gap-2"
            >
              Start Planning <ArrowRight size={20} />
            </button>
        </div>
      </div>

      {/* Event Types */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-white mb-4">Curated Experiences</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Discover our versatile venues designed to cater to every occasion with elegance and style.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                {
                    title: 'Weddings',
                    desc: 'Say "I do" in a setting as beautiful as your love story. Our dedicated wedding specialists handle every detail.',
                    icon: '💍',
                    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop'
                },
                {
                    title: 'Corporate Events',
                    desc: 'Impress clients and inspire teams in our state-of-the-art conference rooms and executive lounges.',
                    icon: '🤝',
                    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop'
                },
                {
                    title: 'Social Gatherings',
                    desc: 'Birthdays, anniversaries, or reunions - make every milestone memorable with our premium catering and service.',
                    icon: '🥂',
                    img: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=2072&auto=format&fit=crop'
                }
            ].map((event, idx) => (
                <div key={idx} className="group relative rounded-3xl overflow-hidden h-[400px] shadow-lg cursor-pointer">
                    <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors z-10"></div>
                    <img src={event.img} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-white bg-gradient-to-t from-black/80 to-transparent">
                        <div className="text-4xl mb-2">{event.icon}</div>
                        <h3 className="text-2xl font-bold font-serif mb-2">{event.title}</h3>
                        <p className="text-slate-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                            {event.desc}
                        </p>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* Inquiry Form */}
      <div id="inquiry-form" className="bg-slate-100 dark:bg-slate-800 py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
                <span className="text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase text-sm mb-2 block">Inquire Now</span>
                <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-white mb-6">Let's Plan Your Event</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                    Ready to bring your vision to life? Fill out the form below, and our event specialists will get back to you with a personalized proposal.
                </p>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Star size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">World-Class Service</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Dedicated event planners at your service.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Capacity for All</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Venues from 10 to 500+ guests.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                {success ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 animate-bounce">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Thank You!</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{success}</p>
                        
                         {user && createdEvent && (
                            <button
                                onClick={() => setPaymentModalOpen(true)}
                                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition w-full shadow-lg mb-4"
                            >
                                Pay Deposit Now (${cost.toLocaleString()})
                            </button>
                        )}
                        
                        <button 
                           onClick={() => { setSuccess(''); setCreatedEvent(null); }}
                           className="text-primary-600 font-bold hover:underline"
                        >
                           Send another inquiry
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                       {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="label">Event Type</label>
                            <CustomSelect 
                                name="eventType" 
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                options={[
                                    { value: 'Wedding', label: 'Wedding' },
                                    { value: 'Corporate', label: 'Corporate' },
                                    { value: 'Social', label: 'Social' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                            />
                          </div>
                          <div>
                            <label className="label">Date</label>
                            <div className="relative">
                                {/* Calendar icon handling: React Datepicker enables custom inputs but simpler to just place icon or rely on placeholder */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                                  <Calendar size={18} />
                                </div>
                                <DatePicker 
                                    selected={formData.date ? new Date(formData.date) : null}
                                    onChange={(date) => {
                                        setFormData(prev => ({ ...prev, date: formatDate(date) }));
                                    }}
                                    minDate={new Date()}
                                    placeholderText="Select event date"
                                    className="input-field pl-12"
                                    wrapperClassName="w-full"
                                    dateFormat="MMM d, yyyy"
                                    required
                                />
                            </div>
                          </div>
                       </div>

                       <div>
                            <label className="label">Expected Guests</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="number" 
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleInputChange}
                                    className="input-field pl-12"
                                    placeholder="e.g. 100"
                                    min="1"
                                    required
                                />
                            </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="label">Your Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                          </div>
                          <div>
                            <label className="label">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="input-field pl-12"
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>
                          </div>
                       </div>

                       <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-field pl-12"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                       </div>

                       <div>
                            <label className="label">Special Requirements</label>
                            <textarea 
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleInputChange}
                                className="input-field min-h-[120px]"
                                placeholder="Tell us more about your event needs..."
                            ></textarea>
                       </div>

                       <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-primary-100 dark:border-slate-600 mb-6 flex justify-between items-center shadow-sm">
                          <div>
                             <p className="text-sm text-slate-500 dark:text-slate-300 mb-1">Estimated Cost</p>
                             <h3 className="text-3xl font-bold text-primary-600 dark:text-primary-400">${cost.toLocaleString()}</h3>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                             <p>Base: ${PRICING[formData.eventType || 'Wedding'].base}</p>
                             <p>+ ${PRICING[formData.eventType || 'Wedding'].guest} / guest</p>
                          </div>
                       </div>

                       <button 
                         type="submit" 
                         disabled={loading}
                         className="w-full btn-primary py-4 text-lg font-bold shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                         {loading ? 'Sending...' : 'Send Inquiry'}
                       </button>
                    </form>
                )}
            </div>
        </div>
      </div>
      
      {paymentModalOpen && createdEvent && (
        <EventPaymentModal 
            event={createdEvent}
            onClose={() => setPaymentModalOpen(false)}
            onSuccess={() => {
                setPaymentModalOpen(false);
                setSuccess('Payment received! Your event is confirmed.');
                setCreatedEvent(null); // Hide button
            }}
        />
      )}

      <GuestFooter />
    </div>
  );
};

export default Events;
