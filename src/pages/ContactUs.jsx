import React, { useState } from 'react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { Mail, MapPin, Phone, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../utils/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/inquiries', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <GuestNavbar transparent />

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
        <div className="relative z-10 text-center px-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Contact Us</h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto font-light">
                We are at your service. Reach out to our concierge team 24/7.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center">
                    <div className="space-y-8">
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Our Location</h5>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    123 Luxury Avenue,<br/>
                                    Paradise City, PC 12345
                                </p>
                            </div>
                         </div>

                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Email Us</h5>
                                <p className="text-slate-600 dark:text-slate-400">contact@luxurystay.com</p>
                                <p className="text-slate-600 dark:text-slate-400">reservations@luxurystay.com</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400">
                                <Phone size={28} />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Call Us</h5>
                                <p className="text-slate-600 dark:text-slate-400">+1 (555) 123-4567</p>
                                <p className="text-slate-600 dark:text-slate-400">24/7 Concierge Support</p>
                            </div>
                         </div>
                    </div>
                    
                    <div className="mt-10 rounded-2xl overflow-hidden h-48 w-full relative">
                         {/* Decorative Mini Map Image */}
                         <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map Location" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-transparent transition-colors">
                            <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-900">View on Map</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 h-full">
                    <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">Send us a Message</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Whether you have a question about room availability, events, or special requests, we're here to help.</p>
                    
                    {status === 'success' ? (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-12 rounded-3xl flex flex-col items-center text-center animate-fade-in border border-green-100 dark:border-green-900/50">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-2xl font-bold mb-3">Message Received</h4>
                            <p className="text-lg opacity-90 max-w-md mx-auto">Thank you for getting in touch. One of our specialists will respond to your inquiry within 24 hours.</p>
                            <button onClick={() => setStatus('idle')} className="mt-8 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-green-700 dark:text-green-400 font-bold shadow-sm hover:shadow-md transition-all">Send another message</button>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    value={formData.firstName} 
                                    onChange={handleChange} 
                                    className="input-field py-3 bg-slate-50 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors" 
                                    placeholder="John" 
                                    required 
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    value={formData.lastName} 
                                    onChange={handleChange} 
                                    className="input-field py-3 bg-slate-50 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors" 
                                    placeholder="Doe" 
                                    required 
                                />
                             </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                  <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="input-field py-3 bg-slate-50 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors" 
                                    placeholder="john@example.com" 
                                    required 
                                />
                               </div>
                               <div>
                                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                  <input 
                                    type="text" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    className="input-field py-3 bg-slate-50 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors" 
                                    placeholder="Inquiry about..." 
                                    required 
                                />
                               </div>
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                              <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                rows={5} 
                                className="input-field py-3 bg-slate-50 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors" 
                                placeholder="How can we help you?" 
                                required
                            ></textarea>
                           </div>
                           
                           {status === 'error' && (
                               <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 font-medium">
                                   <AlertCircle size={18} /> {errorMessage}
                               </div>
                           )}

                           <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/20 flex items-center justify-center gap-2"
                           >
                               {status === 'loading' ? <><Loader className="animate-spin" size={20} /> Sending Message...</> : 'Send Message'}
                           </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      <GuestFooter />
    </div>
  );
};

export default ContactUs;
