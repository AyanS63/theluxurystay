import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { X, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const EventPaymentModal = ({ event, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const res = await api.post(`/events/${event._id}/payment-intent`);
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err.response?.data?.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [event._id]);

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await api.post(`/events/${event._id}/payment-confirm`, { paymentIntentId });
      onSuccess();
    } catch (err) {
      console.error("Confirmation error:", err);
      setError("Payment succcesful but confirmation failed. Please contact support.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
             <DollarSign size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Pay for Event</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {event.eventType} on {new Date(event.date).toLocaleDateString()}
          </p>
        </div>

        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
                {error}
            </div>
        )}

        {loading ? (
            <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                    amount={event.cost} 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={onClose}
                    returnUrl={window.location.origin + '/dashboard/events'} 
                />
            </Elements>
        ) : (
            <div className="text-center py-4 text-slate-500">
                {!error && "Unable to load payment."}
            </div>
        )}
      </div>
    </div>
  );
};

export default EventPaymentModal;
