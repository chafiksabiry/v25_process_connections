"use client";

import React, { useState } from 'react';
import SignInDialog from '../../components/auth/SignInDialog';
import RegistrationDialog from '../../components/auth/RegistrationDialog';
import PasswordRecoveryDialog from '../../components/auth/PasswordRecoveryDialog';
import { AuthProvider } from '../../context/AuthContext';

function AuthPageContent() {
  const [view, setView] = useState<'signin' | 'register' | 'recovery'>('signin');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {view === 'signin' && (
        <SignInDialog
          onRegister={() => setView('register')}
          onForgotPassword={() => setView('recovery')}
        />
      )}
      {view === 'register' && (
        <RegistrationDialog onSignIn={() => setView('signin')} />
      )}
      {view === 'recovery' && (
        <PasswordRecoveryDialog onBack={() => setView('signin')} />
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthPageContent />
    </AuthProvider>
  );
}


