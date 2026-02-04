import React from 'react';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';
import { Award, Users, Globe, Clock, Shield, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <GuestNavbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center z-10">
           <span className="text-primary-400 font-bold tracking-wider uppercase text-sm mb-4 block">Our Story</span>
           <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Redefining Luxury Hospitality</h1>
           <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
             From our humble beginnings to becoming a global icon of elegance, LuxuryStay has always been about one thing: creating unforgettable moments.
           </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
               <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                  To provide an oasis of calm and sophistication where every guest feels like royalty. We strive to anticipate needs before they are spoken and to deliver service that comes from the heart.
               </p>
               <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">Our Vision</h2>
               <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                  To be the world's most admired luxury hotel brand, setting the standard for personalized service, sustainable practices, and architectural beauty.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop" alt="Hotel Interior" className="rounded-2xl shadow-lg mt-8" />
               <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop" alt="Hotel Exterior" className="rounded-2xl shadow-lg" />
            </div>
         </div>
      </div>

      {/* Core Values */}
      <div className="bg-slate-50 dark:bg-slate-800 py-24 px-6">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-16 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[
                  { icon: Heart, title: 'Passion', desc: 'We love what we do, and it shows in every interaction.' },
                  { icon: Shield, title: 'Integrity', desc: 'We act with honesty and transparency in all our dealings.' },
                  { icon: Award, title: 'Excellence', desc: 'We never settle for "good enough". We aim for perfection.' },
                  { icon: Users, title: 'Community', desc: 'We support and uplift the local communities where we operate.' },
                  { icon: Globe, title: 'Sustainability', desc: 'We are committed to protecting our planet for future generations.' },
                  { icon: Clock, title: 'Timelessness', desc: 'We create experiences and spaces that transcend trends.' }
               ].map((value, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                        <value.icon size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{value.title}</h3>
                     <p className="text-slate-500 dark:text-slate-300">{value.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <GuestFooter />
    </div>
  );
};

export default AboutUs;
