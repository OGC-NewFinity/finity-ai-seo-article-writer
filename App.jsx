
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '@/context/AuthContext.js';
import { ThemeProvider } from '@/context/ThemeContext.js';
import { SettingsProvider } from '@/context/SettingsContext.js';
import Loading from '@/components/common/Loading.js';
import { Login, Register, ForgotPassword, ResetPassword, VerifyEmail, Unauthorized } from '@/features/auth';
import LandingPage from '@/pages/LandingPage/LandingPage.jsx';

// Layouts
const PublicLayout = lazy(() => import('@/layouts/PublicLayout.jsx'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout.jsx'));

// Public Pages
const AboutPage = lazy(() => import('@/pages/public/AboutPage.jsx'));
const DocsPage = lazy(() => import('@/pages/public/DocsPage.jsx'));
const PricingPage = lazy(() => import('@/pages/public/PricingPage.jsx'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.jsx'));

// Protected Route Component (not lazy loaded - uses hooks)
import ProtectedRoute from '@/components/routing/ProtectedRoute.jsx';

// Dashboard Components
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard.js'));
const AIAssistant = lazy(() => import('@/features/ai-assistant').then(module => ({ default: module.AIAssistant })));
const Writer = lazy(() => import('@/features/writer').then(module => ({ default: module.WriterMain })));
const Research = lazy(() => import('@/components/Research.js'));
const MediaHub = lazy(() => import('@/features/media').then(module => ({ default: module.MediaHubMain })));
const MediaLayout = lazy(() => import('@/features/media/MediaLayout.js'));
const SettingsPanel = lazy(() => import('@/components/Settings/SettingsPanel.js'));

// Admin Components
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage.js').catch(() => ({ default: () => React.createElement('div', null, 'Admin Settings Page Not Found') })));
const AdminDashboard = lazy(() => import('@/features/admin-dashboard/AdminDashboard.js'));

// Account Components
const AccountPage = lazy(() => import('@/components/Account/AccountPage.js'));
const Subscription = lazy(() => import('@/features/account').then(module => ({ default: module.Subscription })));
const AccountDashboardLayout = lazy(() => import('@/layouts/AccountDashboardLayout.js'));

// Auth redirect wrapper for login/register
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Root route handler - redirects authenticated users to dashboard
const RootRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LandingPage />;
};

// Main App Component with Routing
const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route element={
                  <Suspense fallback={<Loading />}>
                    <PublicLayout />
                  </Suspense>
                }>
                  <Route index element={<RootRoute />} />
                  <Route path="/about" element={
                    <Suspense fallback={<Loading />}>
                      <AboutPage />
                    </Suspense>
                  } />
                  <Route path="/docs" element={
                    <Suspense fallback={<Loading />}>
                      <DocsPage />
                    </Suspense>
                  } />
                  <Route path="/pricing" element={
                    <Suspense fallback={<Loading />}>
                      <PricingPage />
                    </Suspense>
                  } />
                  <Route path="/contact" element={
                    <Suspense fallback={<Loading />}>
                      <ContactPage />
                    </Suspense>
                  } />
                </Route>

                {/* Auth Routes - Redirect to dashboard if already authenticated */}
                <Route path="/login" element={
                  <AuthRedirect>
                    <Login />
                  </AuthRedirect>
                } />
                <Route path="/register" element={
                  <AuthRedirect>
                    <Register />
                  </AuthRedirect>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Dashboard Routes */}
                <Route element={
                  <ProtectedRoute>
                    <Suspense fallback={<Loading />}>
                      <DashboardLayout />
                    </Suspense>
                  </ProtectedRoute>
                }>
                  {/* Default dashboard redirects to AI Assistant */}
                  <Route path="/dashboard" element={<Navigate to="/dashboard/assistant" replace />} />
                  
                  {/* Dashboard feature routes */}
                  <Route path="/dashboard/assistant" element={
                    <Suspense fallback={<Loading />}>
                      <AIAssistant />
                    </Suspense>
                  } />
                  <Route path="/dashboard/overview" element={
                    <Suspense fallback={<Loading />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/dashboard/articles" element={
                    <Suspense fallback={<Loading />}>
                      <Writer settings={{
                        provider: (() => {
                          const saved = localStorage.getItem('nova_xfinity_user_settings');
                          return saved ? JSON.parse(saved).provider : 'gemini';
                        })(),
                        focusKeyphrase: ''
                      }} />
                    </Suspense>
                  } />
                  <Route path="/dashboard/research" element={
                    <Suspense fallback={<Loading />}>
                      <Research />
                    </Suspense>
                  } />
                  <Route path="/dashboard/media" element={
                    <Suspense fallback={<Loading />}>
                      <MediaHub />
                    </Suspense>
                  } />
                  <Route path="/dashboard/settings" element={
                    <Suspense fallback={<Loading />}>
                      <SettingsPanel />
                    </Suspense>
                  } />
                </Route>

                {/* Media Layout Routes (nested routing) */}
                <Route path="/media/*" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute>
                      <MediaLayout />
                    </ProtectedRoute>
                  </Suspense>
                } />

                {/* Account Routes */}
                <Route path="/account/*" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute>
                      <AccountDashboardLayout />
                    </ProtectedRoute>
                  </Suspense>
                } />

                {/* Subscription Routes */}
                <Route path="/subscription" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/subscription/confirm" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  </Suspense>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute adminOnly={true}>
                      <div className="min-h-screen bg-gray-50 p-8 lg:p-12">
                        <div className="max-w-7xl mx-auto">
                          <AdminDashboard />
                        </div>
                      </div>
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/admin/settings" element={
                  <Suspense fallback={<Loading />}>
                    <ProtectedRoute adminOnly={true}>
                      <div className="min-h-screen bg-slate-950 p-8 lg:p-12">
                        <div className="max-w-7xl mx-auto">
                          <AdminSettingsPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  </Suspense>
                } />

                {/* 404 - Not Found */}
                <Route path="*" element={
                  <Suspense fallback={<Loading />}>
                    <NotFoundPage />
                  </Suspense>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
