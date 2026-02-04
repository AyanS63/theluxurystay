import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BedDouble, 
  CalendarDays, 
  TrendingUp,
  LogOut, 
  CalendarCheck,
  Brush,
  Wrench,
  Activity
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import ReceptionistDashboard from '../components/ReceptionistDashboard';
import HotelStaffDashboard from '../components/HotelStaffDashboard';
import EventRequests from '../components/EventRequests';
import InquiryList from '../components/InquiryList';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Combined Stats State
  const [stats, setStats] = useState({
    users: 0,
    rooms: 0,
    bookings: 0,
    revenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [systemStatus, setSystemStatus] = useState('checking'); // connected, error

  const fetchDashboardData = React.useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/bookings')
      ]);

      setSystemStatus('connected');
      const statsData = statsRes.data;
      const bookings = bookingsRes.data;

      setStats(statsData); // Use server-provided stats directly

      setRecentBookings(bookings.slice(0, 10)); 
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setSystemStatus('error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchDashboardData();
      
      // Poll every 30s
      const interval = setInterval(() => fetchDashboardData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDashboardData]);

  if (user?.role === 'receptionist') {
    return <ReceptionistDashboard />;
  }

  if (user?.role === 'hotel_staff' || user?.role === 'housekeeping') {
    return <HotelStaffDashboard />;
  }

  if (loading && !lastUpdated) {
     return <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
       <Activity className="animate-spin mb-4 text-primary-600" size={32}/>
       <p>Loading Dashboard...</p>
     </div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Administrator Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Overview
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
             systemStatus === 'connected' 
               ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
               : 'bg-red-50 text-red-700 border-red-100'
           }`}>
             <div className={`w-2 h-2 rounded-full ${
               systemStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
             }`}></div>
             {systemStatus === 'connected' ? 'System Online' : 'Connection Error'}
           </div>
           {lastUpdated && <span className="text-xs text-slate-400">Updated: {format(lastUpdated, 'HH:mm:ss')}</span>}
        </div>
      </div>
      
      {/* SECTION 1: FINANCIALS & HIGH LEVEL (Admin Focused) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Total Rooms" 
          value={stats.rooms} 
          icon={BedDouble}
          color="emerald"
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.bookings} 
          icon={CalendarDays}
          color="purple"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={TrendingUp}
          color="gold"
        />
      </div>

      {/* SECTION 2: DAILY OPERATIONS (Receptionist Logic) */}
      <div className="space-y-4">
         <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Daily Operations</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           <StatCard 
             title="Today's Check-ins" 
             value={stats.todayCheckIns}
             icon={CalendarCheck}
             color="cyan"
           />
           <StatCard 
             title="Today's Check-outs" 
             value={stats.todayCheckOuts}
             icon={LogOut}
             color="orange"
           />
           <StatCard 
             title="Rooms Cleaning" 
             value={stats.cleaningRooms}
             icon={Brush}
             color="yellow"
           />
           <StatCard 
             title="Maintenance" 
             value={stats.maintenanceRooms}
             icon={Wrench}
             color="red"
           />
         </div>
      </div>

      {/* SECTION 3: ROOM STATUS */}
      <div className="space-y-4">
         <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Room Status</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-slate-500 dark:text-slate-400">Available to Sell</p>
                    <h3 className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.availableRooms}</h3>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400">
                    <BedDouble size={40} />
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-slate-500 dark:text-slate-400">Currently Occupied</p>
                    <h3 className="text-5xl font-bold text-slate-700 dark:text-white mt-2">{stats.occupiedRooms}</h3>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                    <Users size={40} />
                  </div>
              </div>
         </div>
      </div>
      
      {/* SECTION 3.5: EVENTS & INQUIRIES */}
      <div>
        <EventRequests />
      </div>
      
      <div>
        <InquiryList />
      </div>

      {/* SECTION 4: RECENT BOOKINGS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Bookings (Last 10)</h2>
          <button onClick={() => fetchDashboardData()} className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700">
             <Activity size={14}/> Refresh
          </button>
        </div>
        <div className="md:hidden">
          {recentBookings.map((booking) => (
             <div key={booking._id} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                        {booking.user?.username?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 dark:text-white text-sm">{booking.user?.username || 'Guest'}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{booking.user?.email}</p>
                      </div>
                   </div>
                   <StatusBadge status={booking.status} />
                </div>
                
                <div className="flex justify-between items-center mt-3 text-sm">
                   <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Room {booking.room ? booking.room.number : 'N/A'}</span>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-slate-700 dark:text-slate-300">${booking.totalAmount}</p>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.checkIn && !isNaN(new Date(booking.checkIn)) ? format(new Date(booking.checkIn), 'MMM d') : '-'} - {booking.checkOut && !isNaN(new Date(booking.checkOut)) ? format(new Date(booking.checkOut), 'MMM d') : '-'}
                      </div>
                   </div>
                </div>
             </div>
          ))}
          {recentBookings.length === 0 && (
             <div className="p-8 text-center text-slate-500 text-sm">No recent bookings.</div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs">
                        {booking.user?.username?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{booking.user?.username || 'Guest'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{booking.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {booking.room ? `Room ${booking.room.number}` : 'No Room'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 dark:text-slate-500">In:</span>
                        {booking.checkIn && !isNaN(new Date(booking.checkIn)) ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                         <span className="text-xs text-slate-400 dark:text-slate-500">Out:</span>
                        {booking.checkOut && !isNaN(new Date(booking.checkOut)) ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ${booking.totalAmount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No recent bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reusable Components (can be moved to separate files later)
const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    gold: "bg-amber-50 text-amber-600",
    cyan: "bg-cyan-50 text-cyan-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-hover duration-200 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color] || 'bg-slate-100'}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    checkedin: "bg-purple-100 text-purple-800 border-purple-200",
    checkedout: "bg-slate-100 text-slate-800 border-slate-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    paid: "bg-green-100 text-green-800 border-green-200"
  };

  // Normalize case (backend uses CamelCase sometimes, but checks lowercase in code)
  const normalizedStatus = status?.toLowerCase() || 'pending';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[normalizedStatus] || styles.checkedout}`}>
      {status}
    </span>
  );
};

export default Dashboard;
