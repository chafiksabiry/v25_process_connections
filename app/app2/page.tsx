"use client";

import React from 'react';
import Dashboard from '../../components/BackOffice/Dashboard';
import { AuthProvider } from '../../context/AuthContext';

function App2Page() {
  return (
    <Dashboard />
  );
}

export default function Page() {
    return (
        <AuthProvider>
            <App2Page />
        </AuthProvider>
    );
}



