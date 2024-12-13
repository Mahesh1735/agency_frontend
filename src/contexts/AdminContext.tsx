import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const adminUsers = import.meta.env.VITE_ADMIN_USERS?.split(',') || [];
      setIsAdmin(adminUsers.includes(currentUser.uid));
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  return (
    <AdminContext.Provider value={{ isAdmin, selectedUserId, setSelectedUserId }}>
      {children}
    </AdminContext.Provider>
  );
}; 