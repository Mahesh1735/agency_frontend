import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { getUserThreads, Thread } from '../../services/threadService';
import { useThreads } from '../../contexts/ThreadContext';
import { useAdmin } from '../../contexts/AdminContext';

interface SidebarProps {
  adminMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ adminMode = false }) => {
  const { threads, setThreads } = useThreads();
  const { logout, currentUser } = useAuth();
  const { selectedUserId } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      if (!currentUser) return;
      try {
        setIsLoading(true);
        const userThreads = await getUserThreads(adminMode ? selectedUserId! : currentUser.uid);
        const sortedThreads = userThreads.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setThreads(sortedThreads);
      } catch (err) {
        setError('Failed to load threads');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [currentUser, setThreads, adminMode, selectedUserId]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNewChat = () => {
    navigate('/');
  };

  const handleBackToAdmin = () => {
    navigate('/');
  };

  return (
    <div className="w-80 border-r border-gray-800 flex flex-col h-full">
      <Logo />
      <div className="flex flex-col flex-1 min-h-0 p-4">
        {!adminMode && (
          <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        )}

        <div className="mt-6 flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800/20 [&::-webkit-scrollbar-thumb]:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="space-y-2 pr-2">
            {isLoading ? (
              <div className="text-center text-gray-400 py-4">Loading threads...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-4">{error}</div>
            ) : threads.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No threads yet</div>
            ) : (
              threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={adminMode ? `/admin/chat/${thread.id}` : `/chat/${thread.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <MessageSquare size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{thread.title}</p>
                    <p className="text-xs text-gray-400">{new Date(thread.date).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {adminMode && (
            <button
              onClick={handleBackToAdmin}
              className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Back to Admin</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;