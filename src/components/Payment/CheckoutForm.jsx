import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader } from 'lucide-react';

const CheckoutForm = ({ amount, onSuccess, onCancel, returnUrl }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || window.location.origin + '/my-bookings',
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
        setErrorMessage("Unexpected payment status: " + paymentIntent.status);
        setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-6">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 py-3 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
                <>
                    <Loader className="animate-spin" size={20} /> Processing...
                </>
            ) : (
                `Pay $${amount.toFixed(2)}`
            )}
          </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
