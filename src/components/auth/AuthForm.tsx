import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

type FormType = 'login' | 'signup' | 'forgot-password';

const AuthForm = () => {
  const [formType, setFormType] = useState<FormType>('login');

  const toggleForm = (type: FormType) => {
    setFormType(type);
  };

  switch (formType) {
    case 'signup':
      return <Signup toggleForm={() => toggleForm('login')} />;
    case 'forgot-password':
      return <ForgotPassword onBack={() => toggleForm('login')} />;
    default:
      return <Login 
        toggleForm={() => toggleForm('signup')} 
        onForgotPassword={() => toggleForm('forgot-password')} 
      />;
  }
};

export default AuthForm; 