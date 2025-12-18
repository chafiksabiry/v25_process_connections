"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardPanel from '@/components/Dashboard/panels/DashboardPanel';
import GigsPanel from '@/components/Dashboard/panels/GigsPanel';
import ChatPanel from '@/components/Dashboard/panels/ChatPanel';
import SettingsPanel from '@/components/Dashboard/panels/SettingsPanel';
import LeadManagementPanel from '@/components/Dashboard/panels/LeadManagementPanel';
import CallsPanel from '@/components/Dashboard/panels/CallsPanel';
import RepMatchingPanel from '@/components/Dashboard/panels/RepMatchingPanel';
import KnowledgeBasePanel from '@/components/Dashboard/panels/KnowledgeBasePanel';
import AgentsPanel from '@/components/Dashboard/panels/AgentsPanel';
import { useAuth } from '@/lib/dashboard/hooks/useAuth';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activePanel, setActivePanel] = useState('dashboard');

  if (loading) {
    return <Loading />;
  }

  // Render the active panel
  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'gigs':
        return <GigsPanel />;
      case 'leads':
        return <LeadManagementPanel />;
      case 'calls':
        return <CallsPanel />;
      case 'matching':
        return <RepMatchingPanel />;
      case 'agents':
        return <AgentsPanel />;
      case 'knowledge':
        return <KnowledgeBasePanel />;
      case 'chat':
        return <ChatPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Panel Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}
