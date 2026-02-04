import React from 'react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { Plus, Minus } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = React.useState(0);

  const faqs = [
    {
      question: "What are the check-in and check-out times?",
      answer: "Check-in is from 3:00 PM onwards, and check-out is until 12:00 PM (noon). Early check-in or late check-out may be available upon request and subject to availability."
    },
    {
      question: "Is breakfast included in the room rate?",
      answer: "Yes, a complimentary gourmet breakfast buffet is included for all guests at The Grand Kitchen. In-room dining options are also available 24/7."
    },
    {
      question: "Do you offer airport transfers?",
      answer: "We offer luxury airport transfer services. Please contact our concierge at least 24 hours prior to your arrival to arrange your pickup."
    },
    {
      question: "Is the spa open to non-guests?",
      answer: "Yes, Serenity Spa is open to both hotel guests and visitors. Advance booking is recommended to secure your preferred treatment time."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary depending on the rate plan selected. Generally, cancellations made 48 hours before arrival are free of charge. Please check your booking details for specific terms."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <GuestNavbar />
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 dark:text-primary-400 mb-8 text-center">Frequently Asked Questions</h1>
        <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mx-auto mb-16 text-lg">
          Find answers to common questions about your stay at LuxuryStay.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
               <button 
                 onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                 className={`w-full flex items-center justify-between p-6 text-left font-serif font-bold text-lg text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${index === openIndex ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
               >
                 {faq.question}
                 {index === openIndex ? <Minus className="text-primary-600 dark:text-primary-400 shrink-0" /> : <Plus className="text-primary-600 dark:text-primary-400 shrink-0" />}
               </button>
               {index === openIndex && (
                 <div className="p-6 pt-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700">
                    {faq.answer}
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>
      <GuestFooter />
    </div>
  );
};

export default FAQs;
