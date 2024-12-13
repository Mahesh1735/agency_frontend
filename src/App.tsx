import React from 'react';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import AuthForm from './components/auth/AuthForm';
import { useAuth } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { ThreadProvider } from './contexts/ThreadContext';

const AuthenticatedApp = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <AuthForm />;
  }

  return <MainLayout />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThreadProvider>
          <AuthenticatedApp />
        </ThreadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;