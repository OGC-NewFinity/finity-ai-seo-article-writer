import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import subscriptionApi from '@/services/subscriptionApi';
import { getErrorMessage, showError } from '@/utils/errorHandler.js';
import PlanBadge from '@/components/common/PlanBadge.js';

const html = htm.bind(React.createElement);

const BillingPage = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionApi.get('/api/subscription/status');
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await subscriptionApi.post('/api/subscription/portal');

      if (response.data.success && response.data.data.url) {
        window.open(response.data.data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err) {
      console.error('Failed to create portal session:', err);
      showError(err, 'NETWORK_ERROR');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradePlan = (plan) => {
    // Navigate to subscription page for plan changes
    navigate('/subscription');
  };

  if (loading) {
    return html`
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading billing information...</p>
        </div>
      </div>
    `;
  }

  if (error) {
    return html`
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <i className="fa-solid fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Billing</h3>
        <p className="text-red-600 mb-6">${error}</p>
        <button
          onClick=${loadSubscriptionData}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          <i className="fa-solid fa-refresh mr-2"></i>
          Try Again
        </button>
      </div>
    `;
  }

  const currentPlan = subscription?.plan || 'FREE';
  const planLimits = {
    FREE: { price: '$0', tokens: '10K', features: ['Basic features', 'Community support'] },
    PRO: { price: '$29/month', tokens: '100K', features: ['All features', 'Priority support', 'Advanced tools'] },
    ENTERPRISE: { price: 'Custom', tokens: 'Unlimited', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations'] }
  };

  return html`
    <div className="space-y-8 animate-fadeIn">
      <!-- Page Header -->
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Billing</h1>
        <p className="text-gray-500 mt-2">Manage your subscription and payment methods</p>
      </div>

      <!-- Current Plan Card -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
          ${subscription && html`
            <${PlanBadge} plan=${currentPlan} status=${subscription.status?.toLowerCase() || 'active'} />
          `}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Plan</span>
            <span className="text-sm font-bold text-gray-900 uppercase">${currentPlan}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Price</span>
            <span className="text-sm font-bold text-gray-900">${planLimits[currentPlan]?.price || 'N/A'}</span>
          </div>

          ${subscription?.status && html`
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span className=${`text-sm font-bold uppercase ${
                subscription.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                ${subscription.status}
              </span>
            </div>
          `}

          ${subscription?.currentPeriodEnd && html`
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Next Billing Date</span>
              <span className="text-sm font-bold text-gray-900">
                ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          `}

          ${subscription?.cancelAtPeriodEnd && html`
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-xs font-medium text-amber-800">
                <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                Your subscription will be cancelled at the end of the billing period.
              </p>
            </div>
          `}
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          ${currentPlan !== 'ENTERPRISE' && html`
            <button
              onClick=${() => handleUpgradePlan()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <i className="fa-solid fa-arrow-up mr-2"></i>
              Change Plan
            </button>
          `}

          <button
            onClick=${handleManageSubscription}
            disabled=${actionLoading}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            ${actionLoading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-credit-card mr-2"></i>`}
            Manage Subscription
          </button>
        </div>
      </div>

      <!-- Plan Comparison -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${Object.entries(planLimits).map(([plan, details]) => html`
            <div key=${plan} className=${`
              rounded-xl border-2 p-6
              ${plan === currentPlan 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
              }
            `}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 uppercase">${plan}</h3>
                ${plan === currentPlan && html`
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    Current
                  </span>
                `}
              </div>
              <p className="text-2xl font-black text-gray-900 mb-2">${details.price}</p>
              <p className="text-sm text-gray-500 mb-4">${details.tokens} tokens/month</p>
              <ul className="space-y-2 mb-6">
                ${details.features.map((feature, idx) => html`
                  <li key=${idx} className="text-sm text-gray-600 flex items-start">
                    <i className="fa-solid fa-check text-emerald-600 mr-2 mt-1"></i>
                    ${feature}
                  </li>
                `)}
              </ul>
              ${plan !== currentPlan && html`
                <button
                  onClick=${() => handleUpgradePlan(plan)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  ${plan === 'ENTERPRISE' ? 'Contact Sales' : 'Upgrade'}
                </button>
              `}
            </div>
          `)}
        </div>
      </div>

      <!-- Payment Method Section (Placeholder) -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <i className="fa-solid fa-credit-card text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600 font-medium mb-2">Payment method management</p>
          <p className="text-sm text-gray-500">Stripe integration coming soon</p>
          <button
            onClick=${handleManageSubscription}
            disabled=${actionLoading}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Manage Payment Methods
          </button>
        </div>
      </div>

      <!-- Billing History Section (Placeholder) -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <i className="fa-solid fa-file-invoice text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600 font-medium mb-2">Invoice history</p>
          <p className="text-sm text-gray-500 mb-4">Access your invoices and download receipts</p>
          <button
            onClick=${handleManageSubscription}
            disabled=${actionLoading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            View Invoices
          </button>
        </div>
      </div>
    </div>
  `;
};

export default BillingPage;
