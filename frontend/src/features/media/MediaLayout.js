import React from 'react';
import htm from 'htm';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.js';
import NotificationManager from '@/components/common/Notification.js';
import { Suspense } from 'react';
import Loading from '@/components/common/Loading.js';

const html = htm.bind(React.createElement);

// Lazy load media components
const MediaHubDashboard = React.lazy(() => import('./MediaHubDashboard.js'));
const ImageGeneration = React.lazy(() => import('./ImageGeneration.js'));
const ImageEditor = React.lazy(() => import('./ImageEditor.js'));
const VideoGeneration = React.lazy(() => import('./VideoGeneration.js'));

const MediaLayout = () => {
  return html`
    <div className="flex min-h-screen bg-slate-950 selection:bg-blue-500/20 selection:text-blue-200">
      <${Sidebar} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <${Suspense} fallback=${React.createElement(Loading)}>
            <${Routes}>
              <${Route} path="/" element=${React.createElement(MediaHubDashboard)} />
              <${Route} path="/image-generation" element=${React.createElement(ImageGeneration)} />
              <${Route} path="/image-editor" element=${React.createElement(ImageEditor)} />
              <${Route} path="/video-generation" element=${React.createElement(VideoGeneration)} />
              <${Route} path="*" element=${React.createElement(Navigate, { to: "/media", replace: true })} />
            </${Routes}>
          </${Suspense}>
        </div>
      </main>
      <${NotificationManager} />
    </div>
  `;
};

export default MediaLayout;