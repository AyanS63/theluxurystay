import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  MapPin,
  AlertCircle,
  Play
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const HotelStaffDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      
      console.log('DEBUG: Logged In User:', user);
      
      // Filter client-side
      const myTasks = res.data.filter(t => {
        const rawAssignee = t.assignedTo;
        const assigneeId = rawAssignee?._id || rawAssignee;
        const currentUserId = user.id || user._id;

        console.log(`Task ${t._id} | AssignedObj:`, rawAssignee, '| ID:', assigneeId, 'vs Me:', currentUserId, 'Match:', assigneeId == currentUserId); // Using loose equality check just in case
        
        return assigneeId == currentUserId;
      });
      
      // Sort: Pending/In Progress first, then by Priority
      const sorted = myTasks.sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0; // Keep original order (usually date)
      });

      setTasks(sorted);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTasks();
    
    // Poll for new tasks every 30s
    const interval = setInterval(fetchMyTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchMyTasks]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchMyTasks();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your schedule...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hello, {user.username}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {format(new Date(), 'EEEE, MMMM do')} • You have {tasks.filter(t => t.status !== 'Completed').length} active tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
           <div key={task._id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5 transition-all ${
             task.status === 'Completed' ? 'opacity-60 border-slate-100 dark:border-slate-700' : 'border-primary-100 dark:border-primary-900/50 ring-1 ring-primary-50 dark:ring-primary-900/30'
           }`}>
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                     {task.priority}
                   </span>
                   <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{task.type}</span>
                </div>
                {task.status === 'In Progress' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded animate-pulse">
                    <Clock size={12}/> In Progress
                  </span>
                )}
             </div>
             
             <div className="flex items-start gap-4">
               <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                 <h3 className="text-xl font-bold text-slate-700 dark:text-white text-center leading-none">
                   {task.room?.roomNumber || 'N/A'}
                 </h3>
                 <p className="text-[10px] text-slate-400 dark:text-slate-300 text-center mt-1 uppercase">Room</p>
               </div>
               <div>
                 <p className="text-slate-800 dark:text-white font-medium text-lg">{task.description}</p>
                 <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-sm mt-1">
                   <Clock size={14}/> 
                   <span>Assigned: {format(new Date(task.createdAt), 'h:mm a')}</span>
                 </div>
               </div>
             </div>

             <div className="mt-6 flex gap-3">
               {task.status === 'Pending' && (
                 <button 
                   onClick={() => updateStatus(task._id, 'In Progress')}
                   className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                 >
                   <Play size={18} fill="currentColor" /> Start Task
                 </button>
               )}
               
               {task.status === 'In Progress' && (
                 <button 
                   onClick={() => updateStatus(task._id, 'Completed')}
                   className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                 >
                   <CheckCircle size={18} /> Mark Complete
                 </button>
               )}

               {task.status === 'Completed' && (
                 <div className="w-full py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-lg text-center font-medium flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700">
                   <CheckCircle size={16} /> Completed
                 </div>
               )}
             </div>
           </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-white">All Caught Up!</h3>
            <p className="text-slate-400 dark:text-slate-500">You have no pending tasks right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HotelStaffDashboard;
