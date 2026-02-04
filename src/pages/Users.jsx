import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Loader, Trash2, X, Edit, Filter, ArrowUpDown, UserCog } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomSelect from '../components/CustomSelect';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'guest'
  });
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  // Filter & Sort State
  const [filterRole, setFilterRole] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Derived State
  const filteredUsers = users
    .filter(user => filterRole === 'All' || user.role === filterRole)
    .filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
        // Fallback to sort by ID if createdAt is missing (Mongo IDs are sortable by time)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        
        if (sortOrder === 'newest') {
             // If dates are equal (or 0), use ID as tiebreaker
             if (dateA === dateB) return b._id.localeCompare(a._id);
             return dateB - dateA;
        } else {
             if (dateA === dateB) return a._id.localeCompare(b._id);
             return dateA - dateB;
        }
    });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Password not required for update unless changed (backend logic needed if we want to support password update here, keeping it simple for roles)
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
          await api.put(`/users/${editingUser._id}`, formData);
      } else {
          await api.post('/users', formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'guest' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = (id) => {
      setConfirmation({
          isOpen: true,
          type: 'danger',
          title: 'Delete User',
          message: 'Are you sure you want to delete this user? This action cannot be undone.',
          confirmText: 'Delete',
          onConfirm: async () => {
              try {
                  await api.delete(`/users/${id}`);
                  fetchUsers();
                  setConfirmation(prev => ({ ...prev, isOpen: false }));
              } catch (err) {
                  console.error('Failed to delete user', err);
                  alert('Failed to delete user');
              }
          }
      });
  };

  if (loading) return <div className="p-6"><Loader className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">User Management</h2>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role: 'guest' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
        <div className="flex-1">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
        </div>
        <div className="flex-1">
             <CustomSelect 
                label="Filter by Role"
                options={[
                    { value: 'All', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'receptionist', label: 'Receptionist' },
                    { value: 'hotel_staff', label: 'Hotel Staff' },
                    { value: 'guest', label: 'Guest' }
                ]}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                icon={Filter}
             />
          </div>
          <div className="flex-1">
             <CustomSelect 
                label="Sort Order"
                options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' }
                ]}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                icon={ArrowUpDown}
             />
          </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card p-4 space-y-3">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{user.username}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 break-all">{user.email}</p>
               </div>
               <span className="capitalize bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium border border-primary-100">
                  {user.role}
               </span>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => handleEdit(user)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary-700 font-medium text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit size={18} /> Edit
                </button>
               <button 
                  onClick={() => handleDelete(user._id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} /> Delete
                </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
            <div className="col-span-full text-center p-8 text-slate-500">No users found matching filters.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="py-4 px-6 font-medium">Username</th>
              <th className="py-4 px-6 font-medium">Email</th>
              <th className="py-4 px-6 font-medium">Role</th>
              <th className="py-4 px-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-200">{user.username}</td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{user.email}</td>
                <td className="py-4 px-6">
                  <span className="capitalize bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium border border-primary-100">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="text-slate-500 hover:text-primary-700 font-medium text-sm p-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              )}
              <div>
                <CustomSelect
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  options={[
                    { value: 'guest', label: 'Guest' },
                    { value: 'receptionist', label: 'Receptionist' },
                    { value: 'hotel_staff', label: 'Hotel Staff' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  icon={UserCog}
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full btn-primary">{editingUser ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Confirmation Modal */}
      <ConfirmationModal 
          isOpen={confirmation.isOpen}
          onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          type={confirmation.type}
          confirmText={confirmation.confirmText}
      />
    </div>
  );
};

export default UserManagement;
