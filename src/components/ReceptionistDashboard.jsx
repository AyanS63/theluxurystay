import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LogOut, 
  BedDouble, 
  CalendarCheck,
  Brush,
  Wrench,
  Activity
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import EventRequests from './EventRequests';
import InquiryList from './InquiryList';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
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
  const [errorDetail, setErrorDetail] = useState('');

  const fetchDashboardData = React.useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setErrorDetail('');
      
      // Parallel requests for efficiency
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);

      setSystemStatus('connected');

      const bookings = bookingsRes.data;
      const rooms = roomsRes.data;
      // setAllRooms(rooms);

      const today = format(new Date(), 'yyyy-MM-dd');

      const checkIns = bookings.filter(b => {
        if (!b.checkIn) return false;
        const date = new Date(b.checkIn);
        const status = b.status?.toLowerCase();
        return !isNaN(date.getTime()) && format(date, 'yyyy-MM-dd') === today && (status === 'confirmed' || status === 'checked_in');
      });
      
      const checkOuts = bookings.filter(b => {
        if (!b.checkOut) return false;
        const date = new Date(b.checkOut);
        const status = b.status?.toLowerCase();
        return !isNaN(date.getTime()) && format(date, 'yyyy-MM-dd') === today && (status === 'checked_in' || status === 'checked_out');
      });

      // Room Status Counts (Case insensitive matching)
      const available = rooms.filter(r => r.status?.toLowerCase() === 'available').length;
      const occupied = rooms.filter(r => r.status?.toLowerCase() === 'occupied').length;
      const cleaning = rooms.filter(r => r.status?.toLowerCase() === 'cleaning').length;
      const maintenance = rooms.filter(r => r.status?.toLowerCase() === 'maintenance').length;

      setStats({
        todayCheckIns: checkIns.length,
        todayCheckOuts: checkOuts.length,
        availableRooms: available,
        occupiedRooms: occupied,
        cleaningRooms: cleaning,
        maintenanceRooms: maintenance
      });

      setRecentBookings(bookings.slice(0, 5));
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching data:', error);
      setSystemStatus('error');
      setErrorDetail(error.response?.status === 403 ? 'Access Denied (403)' : error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Poll every 30 seconds for "Runtime" updates
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading && !lastUpdated) {
    return <div className="p-8 text-center text-slate-500 flex flex-col items-center">
      <div className="animate-spin mb-4"><Activity size={32}/></div>
      Connecting to Hotel Database...
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Front Desk Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            systemStatus === 'connected' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              systemStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            {systemStatus === 'connected' ? 'System Online (Runtime)' : (errorDetail || 'Connection Lost')}
          </div>
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </span>
          )}
        </div>
      </div>

      {/* Primary Ops Grid */}
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Daily Operations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Today's Check-ins" 
          value={stats.todayCheckIns}
          icon={CalendarCheck}
          color="blue"
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

      <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-4">Room Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

      <div className="mt-8">
        <EventRequests />
      </div>

      <div className="mt-8">
        <InquiryList />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Bookings</h2>
          <button onClick={() => fetchDashboardData()} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center gap-1">
            <Activity size={14}/> Force Refresh
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
                   <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                      <div><span className="text-slate-400">In:</span> {booking.checkIn && !isNaN(new Date(booking.checkIn)) ? format(new Date(booking.checkIn), 'MMM d') : '-'}</div>
                      <div><span className="text-slate-400">Out:</span> {booking.checkOut && !isNaN(new Date(booking.checkOut)) ? format(new Date(booking.checkOut), 'MMM d') : '-'}</div>
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
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
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

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-5xl font-bold text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${colorStyles[color] || colorStyles.slate}`}>
          <Icon size={40} />
        </div>
      </div>
      {/* Decorative bg icon */}
      <Icon className="absolute -right-4 -bottom-4 text-slate-50 dark:text-slate-700/50 opacity-50" size={100} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    checked_in: "bg-purple-100 text-purple-800 border-purple-200",
    checked_out: "bg-slate-100 text-slate-800 border-slate-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    cancelled: "Cancelled",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.checked_out}`}>
      {labels[status] || status}
    </span>
  );
};

export default ReceptionistDashboard;
