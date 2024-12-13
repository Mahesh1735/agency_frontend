import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ThreadProvider } from './contexts/ThreadContext';
import AuthForm from './components/auth/AuthForm';
import AdminHome from './components/admin/AdminHome';
import { useAuth } from './contexts/AuthContext';
import { useAdmin } from './contexts/AdminContext';

const AuthenticatedApp = () => {
  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  
  if (!currentUser) {
    return <AuthForm />;
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/admin/*" element={<MainLayout adminMode />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <ThreadProvider>
            <AuthenticatedApp />
          </ThreadProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;