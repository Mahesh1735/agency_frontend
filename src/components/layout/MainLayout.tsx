import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatInterface from '../chat/ChatInterface';
import TasksPanel from '../tasks/TasksPanel';

const MainLayout = () => {
  const [tasks, setTasks] = useState<Record<string, any>>({});

  const handleTasksUpdate = (newTasks: Record<string, any>) => {
    setTasks(newTasks);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-gray-100">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<ChatInterface onTasksUpdate={handleTasksUpdate} />} />
            <Route path="/chat/:threadId" element={<ChatInterface onTasksUpdate={handleTasksUpdate} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <TasksPanel tasks={tasks} />
      </div>
    </div>
  );
};

export default MainLayout;