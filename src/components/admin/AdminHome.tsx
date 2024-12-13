import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, MessageSquare, Search, ArrowRight } from 'lucide-react';
import { getAllUsersActivity, UserActivity } from '../../services/adminService';
import { useAdmin } from '../../contexts/AdminContext';

const AdminHome = () => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setSelectedUserId } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userActivity = await getAllUsersActivity();
        setUsers(userActivity);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    navigate('/admin/chat');
  };

  const filteredUsers = users.filter(user => 
    user.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0A0A0F]">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">View and manage user conversations</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Users size={20} className="text-gray-400" />
            <span className="text-gray-200 font-medium">{users.length} Users</span>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-200 placeholder-gray-500"
          />
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Loading users...
            </div>
          </div>
        ) : (
          <div className="grid gap-4 pb-8">
            {filteredUsers.map((user) => (
              <button
                key={user.userId}
                onClick={() => handleUserSelect(user.userId)}
                className="group flex items-center justify-between p-5 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700/50 rounded-xl transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">{user.userId}</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span>Active: {new Date(user.lastActive).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span>{user.threadCount} threads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Chats</span>
                  <ArrowRight size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome; 