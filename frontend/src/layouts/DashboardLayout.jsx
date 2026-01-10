import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.js';
import NotificationManager from '@/components/common/Notification.js';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 selection:bg-blue-500/20 selection:text-blue-200">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <NotificationManager />
    </div>
  );
};

export default DashboardLayout;
