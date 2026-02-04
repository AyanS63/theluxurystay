import React from 'react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <GuestNavbar />
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 dark:text-primary-400 mb-8">Terms of Service</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12">Last updated: December 12, 2025</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
           <p className="mb-6">Please read these terms of service carefully before using LuxuryStay services.</p>
           
           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">1. Conditions of Use</h3>
           <p className="mb-6">
             By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">2. Privacy Policy</h3>
           <p className="mb-6">
             Before you continue using our website, we advise you to read our privacy policy regarding our user data collection. It will help you better understand our practices.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">3. Bookings and Payments</h3>
           <p className="mb-6">
             All bookings are subject to availability and acceptance by LuxuryStay. Prices are subject to change without notice. Full payment or a deposit may be required to secure your reservation. Cancellation policies apply as stated during the booking process.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">4. User Accounts</h3>
           <p className="mb-6">
             As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">5. Applicable Law</h3>
           <p className="mb-6">
             By visiting this website, you agree that the laws of the jurisdiction, without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between LuxuryStay and you.
           </p>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
};

export default TermsOfService;
