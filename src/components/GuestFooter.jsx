import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const GuestFooter = () => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
             <div className="text-3xl font-serif font-bold text-white mb-6">LuxuryStay</div>
             <p className="leading-relaxed mb-6">Experience the pinnacle of luxury and comfort. Your home away from home.</p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors cursor-pointer"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors cursor-pointer"><Twitter size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors cursor-pointer"><Instagram size={20} /></a>
             </div>
          </div>
          <div>
             <h5 className="text-white font-bold mb-6 text-lg">Quick Links</h5>
             <ul className="space-y-4">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                <li><Link to="/rooms" className="hover:text-primary-400 transition-colors">Rooms & Suites</Link></li>
                <li><Link to="/events" className="hover:text-primary-400 transition-colors">Events</Link></li>
                <li><Link to="/about-us" className="hover:text-primary-400 transition-colors">About Us</Link></li>
             </ul>
          </div>
          <div>
             <h5 className="text-white font-bold mb-6 text-lg">Support</h5>
             <ul className="space-y-4">
               <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/faqs" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
             </ul>
          </div>
          <div>
             <h5 className="text-white font-bold mb-6 text-lg">Contact</h5>
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                   <MapPin size={20} className="text-primary-500 shrink-0 mt-1" />
                   <span>123 Luxury Ave, Paradise City, PC 12345</span>
                </li>
                <li className="flex items-center gap-3">
                   <Mail size={20} className="text-primary-500 shrink-0" />
                   <span>contact@luxurystay.com</span>
                </li>
             </ul>
          </div>
       </div>
       <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="text-sm">© 2026 LuxuryStay Hotel. All rights reserved.</div>
         <div className="flex gap-8 text-sm">
           <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
           <Link to="/terms-of-service" className="hover:text-white">Terms</Link>
           <Link to="/contact" className="hover:text-white">Support</Link>
         </div>
       </div>
    </footer>
  );
};

export default GuestFooter;
