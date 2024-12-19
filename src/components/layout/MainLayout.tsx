import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatInterface from '../chat/ChatInterface';
import TasksPanel from '../tasks/TasksPanel';
import { useAdmin } from '../../contexts/AdminContext';

interface MainLayoutProps {
  adminMode?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ adminMode = false }) => {
  const [tasks, setTasks] = useState<Record<string, any>>({});
  const { selectedUserId } = useAdmin();

  const handleTasksUpdate = (newTasks: Record<string, any>) => {
    setTasks(newTasks);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-gray-100">
      <Sidebar adminMode={adminMode} />
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route 
              path="/" 
              element={
                <ChatInterface 
                  onTasksUpdate={handleTasksUpdate} 
                  adminMode={adminMode}
                  userId={selectedUserId} 
                />
              } 
            />
            <Route 
              path="chat/:threadId" 
              element={
                <ChatInterface 
                  onTasksUpdate={handleTasksUpdate} 
                  adminMode={adminMode}
                  userId={selectedUserId}
                />
              } 
            />
            {adminMode && (
              <Route 
                path="chat/:threadId" 
                element={
                  <ChatInterface 
                    onTasksUpdate={handleTasksUpdate} 
                    adminMode={adminMode}
                    userId={selectedUserId}
                  />
                } 
              />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;