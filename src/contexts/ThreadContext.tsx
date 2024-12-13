import React, { createContext, useContext, useState } from 'react';
import { Thread } from '../services/threadService';

interface ThreadContextType {
  threads: Thread[];
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  addThread: (thread: Thread) => void;
  updateThreadInState: (threadId: string, updates: Partial<Thread>) => void;
}

const ThreadContext = createContext<ThreadContextType | null>(null);

export const useThreads = () => {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error('useThreads must be used within a ThreadProvider');
  }
  return context;
};

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<Thread[]>([]);

  const addThread = (thread: Thread) => {
    setThreads(prevThreads => 
      [thread, ...prevThreads].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const updateThreadInState = (threadId: string, updates: Partial<Thread>) => {
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === threadId 
          ? { ...thread, ...updates }
          : thread
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  return (
    <ThreadContext.Provider value={{ threads, setThreads, addThread, updateThreadInState }}>
      {children}
    </ThreadContext.Provider>
  );
}; 