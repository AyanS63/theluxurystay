import React from 'react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <GuestNavbar />
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 dark:text-primary-400 mb-8">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12">Last updated: December 12, 2025</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
           <p className="mb-6">At LuxuryStay, accessible from luxurystay.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by LuxuryStay and how we use it.</p>
           
           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">Log Files</h3>
           <p className="mb-6">
             LuxuryStay follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">Cookies and Web Beacons</h3>
           <p className="mb-6">
             Like any other website, LuxuryStay uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">Our Advertising Partners</h3>
           <p className="mb-6">
             Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">Data Protection</h3>
           <p className="mb-6">
             We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
           </p>

           <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-8 mb-4">Contact Us</h3>
           <p className="mb-6">
             If you have any questions about this Privacy Policy, please contact us at privacy@luxurystay.com.
           </p>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
};

export default PrivacyPolicy;
