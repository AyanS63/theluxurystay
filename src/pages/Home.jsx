import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Sparkles, MapPin, Star, ArrowRight, User, Utensils, Coffee, Wine, Quote, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GuestNavbar from '../components/GuestNavbar';
import GuestFooter from '../components/GuestFooter';

const Home = () => {
  // const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-gray-100">
      <GuestNavbar transparent={true} />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
           <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/40 to-slate-900 opacity-80 z-10"></div>
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center animate-ken-burns"></div>
        </div>
        
        <div className="relative z-20 text-center max-w-5xl px-4 animate-fade-in-up">
          <span className="text-primary-300 font-medium tracking-[0.3em] uppercase text-sm mb-6 block">Welcome to Paradise</span>
          <h2 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight drop-shadow-lg">
            Experience Luxury <br/> Like Never Before
          </h2>
          <p className="text-slate-200 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Discover a world of comfort, elegance, and personalized service at LuxuryStay. Your perfect getaway awaits in the heart of the city.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
             <Link to="/rooms" className="bg-primary-600 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 hover:shadow-2xl hover:shadow-primary-600/30">
               Book Your Stay <ArrowRight size={20} />
             </Link>
             <Link to="/rooms" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-white/20 transition-all">
               Explore Experiences
             </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-32 px-6 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-primary-600 dark:text-primary-400 font-bold tracking-wider uppercase text-xs mb-2 block">Our Promise</span>
            <h3 className="text-4xl font-serif font-bold text-slate-800 dark:text-white mb-6">Why Choose LuxuryStay</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">We redefine hospitality with our attention to detail, commitment to excellence, and passion for service.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: BedDouble, title: 'Premium Rooms', desc: 'Spacious suites designed for your ultimate comfort with smart amenities and breathtaking views.' },
              { icon: Sparkles, title: '5-Star Service', desc: 'Our dedicated 24/7 concierge team is here to fulfill every request, ensuring a seamless stay.' },
              { icon: MapPin, title: 'Prime Location', desc: 'Located in the heart of the city, perfectly positioned near major attractions and business hubs.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-700 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-600">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-8 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 transform group-hover:rotate-6">
                  <feature.icon size={32} />
                </div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 font-serif">{feature.title}</h4>
                <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Room Mockup */}
      <section className="py-32 px-6 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1 space-y-8">
             <div className="flex items-center gap-2 text-amber-400 font-medium">
               {[...Array(5)].map((_, i) => <Star key={i} className="fill-current" size={20} />)}
               <span className="text-slate-400 dark:text-slate-500 ml-3 text-sm font-bold uppercase tracking-wide">Top Rated Suite</span>
             </div>
             <h3 className="text-5xl font-serif font-bold text-slate-800 dark:text-white leading-tight">The Royal Suite</h3>
             <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed font-light">
               Indulge in our finest accommodation featuring panoramic ocean views, a private jacuzzi, and a dedicated butler. The Royal Suite defines opulence and comfort.
             </p>
             <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-slate-700 dark:text-slate-300">
               {['King-size smart bed', 'Ocean view private balcony', 'Voice-controlled lighting', 'Marbled bathroom with jacuzzi', 'Private bar & lounge area', 'Complimentary spa access'].map(item => (
                 <li key={item} className="flex items-center gap-3 list-none font-medium">
                   <div className="w-2 h-2 rounded-full bg-primary-500"></div> {item}
                 </li>
               ))}
             </div>
             <div className="pt-4">
                <Link to="/rooms" className="btn-primary text-lg px-8 py-3 rounded-full inline-flex items-center gap-2">
                  View Availability <ArrowRight size={18} />
                </Link>
             </div>
           </div>
           <div className="flex-1 relative group">
             <div className="absolute -inset-4 bg-primary-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
             <img 
               src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop" 
               alt="Royal Suite" 
               className="relative rounded-3xl shadow-2xl z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-700 w-full"
             />
             <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                   <div className="bg-green-100 p-3 rounded-full text-green-600">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800 text-lg">Special Offer</p>
                      <p className="text-slate-500 text-sm">20% off this weekend</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Dining & Experience Section */}
      <section id="dining" className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-fixed opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <span className="text-primary-400 font-bold tracking-wider uppercase text-xs mb-2 block">Taste & Relax</span>
                <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight">World-Class Dining <br/> & Experiences</h3>
              </div>
              <p className="text-slate-300 max-w-md text-lg leading-relaxed">
                 From Michelin-starred gastronomy to rejuvenating spa treatments, curate your perfect stay with our exclusive amenities.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start mb-8">
                    <Utensils className="text-primary-400 group-hover:scale-110 transition-transform" size={40} />
                    <ArrowRight className="text-slate-500 group-hover:text-white" />
                 </div>
                 <h4 className="text-2xl font-serif font-bold mb-3">The Grand Kitchen</h4>
                 <p className="text-slate-400 leading-relaxed">Experience a culinary journey with our award-winning chefs featuring international cuisines and local delicacies.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start mb-8">
                    <Wine className="text-primary-400 group-hover:scale-110 transition-transform" size={40} />
                     <ArrowRight className="text-slate-500 group-hover:text-white" />
                 </div>
                 <h4 className="text-2xl font-serif font-bold mb-3">Skyline Bar</h4>
                 <p className="text-slate-400 leading-relaxed">Sip on handcrafted cocktails while enjoying breathtaking panoramic views of the city skyline from our rooftop bar.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start mb-8">
                    <Coffee className="text-primary-400 group-hover:scale-110 transition-transform" size={40} />
                     <ArrowRight className="text-slate-500 group-hover:text-white" />
                 </div>
                 <h4 className="text-2xl font-serif font-bold mb-3">Serenity Spa</h4>
                 <p className="text-slate-400 leading-relaxed">Rejuvenate your body and mind with our holistic spa treatments, including massages, facials, and a thermal suite.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 bg-slate-50 dark:bg-slate-800">
         <div className="max-w-5xl mx-auto text-center">
            <Quote size={48} className="text-primary-200 dark:text-primary-800 mx-auto mb-8 fill-current" />
            <h3 className="text-4xl font-serif font-bold text-slate-800 dark:text-white mb-12">What Our Guests Say</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-700 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-600 text-left">
                  <div className="flex gap-4 items-center mb-6">
                     <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Guest" className="w-14 h-14 rounded-full object-cover" />
                     <div>
                        <p className="font-bold text-slate-800 dark:text-white">Sarah Johnson</p>
                        <div className="flex text-amber-400 text-xs">
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                        </div>
                     </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"The attention to detail was immaculate. From the warm welcome to the personalized room service, every moment felt special. The Royal Suite was breathtaking!"</p>
               </div>
               <div className="bg-white dark:bg-slate-700 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-600 text-left">
                  <div className="flex gap-4 items-center mb-6">
                     <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Guest" className="w-14 h-14 rounded-full object-cover" />
                     <div>
                        <p className="font-bold text-slate-800 dark:text-white">Michael Chen</p>
                         <div className="flex text-amber-400 text-xs">
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                           <Star className="fill-current" size={14} />
                        </div>
                     </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"Best hotel experience I've had in years. The spa was exactly what I needed, and the food at The Grand Kitchen was absolutely world-class. Highly recommended!"</p>
               </div>
            </div>
         </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6 bg-primary-700 dark:bg-primary-900 text-white">
         <div className="max-w-4xl mx-auto bg-primary-800/50 dark:bg-primary-950/50 p-12 rounded-3xl backdrop-blur-sm border border-primary-500/30 dark:border-primary-800/30 text-center">
            <Mail size={48} className="mx-auto mb-6 text-primary-200" />
            <h3 className="text-3xl font-serif font-bold mb-4">Subscribe to our Newsletter</h3>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">Stay updated with our latest offers, exclusive events, and seasonal promotions. Join our luxury community today.</p>
            
            <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
               <input 
                 type="email" 
                 placeholder="Your email address" 
                 className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
               />
               <button className="bg-white text-primary-900 px-8 py-4 rounded-full font-bold hover:bg-primary-50 transition-colors shadow-lg">
                  Subscribe
               </button>
            </form>
         </div>
      </section>

      <GuestFooter />
    </div>
  );
};

export default Home;
