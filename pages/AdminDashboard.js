import React, { useState, useEffect } from 'react';
import htm from 'htm';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const html = htm.bind(React.createElement);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState(null);
  const [quotaUsage, setQuotaUsage] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get subscription API URL (Node.js backend)
      const subscriptionApiUrl = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'http://localhost:8000';
      const accessToken = Cookies.get('access_token');
      
      // Prepare headers for subscription API calls
      const headers = {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      };
      
      // Fetch all admin data in parallel
      const [usersRes, subscriptionsRes, paymentsRes, quotaRes] = await Promise.allSettled([
        api.get('/api/admin/users'),
        fetch(`${subscriptionApiUrl}/api/admin/subscriptions`, {
          credentials: 'include',
          headers
        }),
        fetch(`${subscriptionApiUrl}/api/admin/payments`, {
          credentials: 'include',
          headers
        }),
        fetch(`${subscriptionApiUrl}/api/admin/quota`, {
          credentials: 'include',
          headers
        })
      ]);

      // Process users
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data || []);
      } else {
        console.warn('Failed to load users:', usersRes.reason);
      }

      // Process subscriptions
      if (subscriptionsRes.status === 'fulfilled' && subscriptionsRes.value.ok) {
        try {
          const data = await subscriptionsRes.value.json();
          setSubscriptions(data);
        } catch (e) {
          console.warn('Failed to parse subscriptions response:', e);
        }
      } else {
        console.warn('Failed to load subscriptions:', subscriptionsRes.reason || subscriptionsRes.value?.statusText);
      }

      // Process payments
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        try {
          const data = await paymentsRes.value.json();
          setPayments(Array.isArray(data) ? data : (data.payments || []));
        } catch (e) {
          console.warn('Failed to parse payments response:', e);
        }
      } else {
        console.warn('Failed to load payments:', paymentsRes.reason || paymentsRes.value?.statusText);
      }

      // Process quota usage
      if (quotaRes.status === 'fulfilled' && quotaRes.value.ok) {
        try {
          const data = await quotaRes.value.json();
          setQuotaUsage(data);
        } catch (e) {
          console.warn('Failed to parse quota usage response:', e);
        }
      } else {
        console.warn('Failed to load quota usage:', quotaRes.reason || quotaRes.value?.statusText);
      }

    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data. Some endpoints may not be available yet.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return html`
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    `;
  }

  return html`
    <div className="space-y-8 animate-fadeIn">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage users, subscriptions, and system overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm">
            <i className="fa-solid fa-shield-halved mr-2"></i>
            Admin Access
          </div>
        </div>
      </header>

      ${error && html`
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <i className="fa-solid fa-exclamation-triangle mr-2"></i>
          ${error}
        </div>
      `}

      <!-- Users Overview -->
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <i className="fa-solid fa-users text-blue-600 mr-3"></i>
            Users Overview
          </h3>
          <span className="text-sm text-gray-500 font-medium">Total: ${users.length}</span>
        </div>
        
        ${users.length > 0 ? html`
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                ${users.slice(0, 10).map((u, idx) => html`
                  <tr key=${idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">${u.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className=${`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        ${u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className=${`px-2 py-1 rounded text-xs font-bold ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        ${u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      ${u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
            ${users.length > 10 && html`
              <p className="text-xs text-gray-500 mt-4 text-center">Showing 10 of ${users.length} users</p>
            `}
          </div>
        ` : html`
          <div className="text-center py-8 text-gray-500">
            <i className="fa-solid fa-users text-4xl mb-3 opacity-50"></i>
            <p className="font-medium">No users found or endpoint not available</p>
          </div>
        `}
      </div>

      <!-- Subscription Overview -->
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800">Active Subscriptions</h3>
            <i className="fa-solid fa-check-circle text-green-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-slate-800">${subscriptions?.active || 0}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Currently active plans</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800">Canceled</h3>
            <i className="fa-solid fa-times-circle text-red-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-slate-800">${subscriptions?.canceled || 0}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Canceled subscriptions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800">Total</h3>
            <i className="fa-solid fa-chart-line text-blue-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-slate-800">${subscriptions ? (subscriptions.active || 0) + (subscriptions.canceled || 0) : 0}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">All subscriptions</p>
        </div>
      </div>

      <!-- Quota Usage Summary -->
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
          <i className="fa-solid fa-chart-pie text-blue-600 mr-3"></i>
          Quota Usage Summary
        </h3>
        
        ${quotaUsage ? html`
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${['articles', 'images', 'videos', 'research'].map((type) => {
              const usage = quotaUsage[type] || { used: 0, limit: 0 };
              const percentage = usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0;
              return html`
                <div key=${type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">${type}</span>
                    <span className="text-xs font-black text-gray-800">${percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className=${`h-2 rounded-full ${
                        percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style=${{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    ${usage.used || 0} / ${usage.limit || 0}
                  </p>
                </div>
              `;
            })}
          </div>
        ` : html`
          <div className="text-center py-8 text-gray-500">
            <i className="fa-solid fa-chart-pie text-4xl mb-3 opacity-50"></i>
            <p className="font-medium">Quota usage data not available</p>
          </div>
        `}
      </div>

      <!-- Recent Payments Table -->
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <i className="fa-solid fa-credit-card text-green-600 mr-3"></i>
            Recent Payments
          </h3>
          <span className="text-sm text-gray-500 font-medium">Last ${payments.length} transactions</span>
        </div>
        
        ${payments.length > 0 ? html`
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                ${payments.slice(0, 10).map((payment, idx) => html`
                  <tr key=${idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">${payment.user_email || payment.userId || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                        ${payment.plan || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">$${payment.amount || '0.00'}</td>
                    <td className="py-3 px-4">
                      <span className=${`px-2 py-1 rounded text-xs font-bold ${
                        payment.status === 'completed' || payment.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-700' 
                          : payment.status === 'pending' || payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        ${payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      ${payment.created_at || payment.date ? new Date(payment.created_at || payment.date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
            ${payments.length > 10 && html`
              <p className="text-xs text-gray-500 mt-4 text-center">Showing 10 of ${payments.length} payments</p>
            `}
          </div>
        ` : html`
          <div className="text-center py-8 text-gray-500">
            <i className="fa-solid fa-credit-card text-4xl mb-3 opacity-50"></i>
            <p className="font-medium">No payments found or endpoint not available</p>
          </div>
        `}
      </div>

      <!-- Plan Controls Placeholder -->
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-100 p-6">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-sliders text-purple-600 mr-3"></i>
          Plan Controls
        </h3>
        <p className="text-gray-600 font-medium mb-4">
          Manage subscription plans, pricing, and feature limits.
        </p>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500 italic">
            Plan management interface coming soon...
          </p>
        </div>
      </div>
    </div>
  `;
};

export default AdminDashboard;
