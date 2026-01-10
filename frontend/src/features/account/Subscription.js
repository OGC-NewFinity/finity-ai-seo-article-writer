import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import subscriptionApi from '@/services/subscriptionApi.js';
import { showError, getErrorMessage } from '@/utils/errorHandler.js';
import SubscriptionCard from '@/components/Account/SubscriptionCard.js';
import UsageStats from './UsageStats.js';
import PlanComparison from './PlanComparison.js';
import UpgradeModal from './UpgradeModal.js';
import PlanBadge from '@/components/common/PlanBadge.js';
import { checkFeatureQuota, getQuotaWarningMessage } from '@/utils';

const html = htm.bind(React.createElement);

const Subscription = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState(null); // 'processing', 'success', 'error'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, authLoading]);

  // Execute PayPal subscription after approval
  const executePayPalSubscription = async (subscriptionId, token) => {
    setConfirmationStatus('processing');
    setError(null);

    try {
      const response = await subscriptionApi.post('/api/subscription/paypal/execute', {
        subscriptionId,
        token
      });

      if (response.data.success) {
        setConfirmationStatus('success');
        // Remove query params
        navigate('/subscription', { replace: true });
        // Reload subscription data
        await loadSubscriptionData();
        // Clear status after 5 seconds
        setTimeout(() => setConfirmationStatus(null), 5000);
      } else {
        throw new Error(response.data.error?.message || 'Subscription activation failed');
      }
    } catch (err) {
      console.error('PayPal execution error:', err);
      setConfirmationStatus('error');
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
      // Remove query params
      navigate('/subscription', { replace: true });
    }
  };

  // Handle PayPal confirmation
  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id');
    const token = searchParams.get('token');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      setConfirmationStatus('error');
      setError(getErrorMessage('PayPal checkout was canceled by user', 'VALIDATION_ERROR'));
      // Remove query params
      navigate('/subscription', { replace: true });
      return;
    }

    if (subscriptionId && token && isAuthenticated) {
      executePayPalSubscription(subscriptionId, token);
    }
  }, [searchParams, isAuthenticated]);

  // Fetch subscription data
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptionData();
    }
  }, [isAuthenticated]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch subscription status and usage in parallel
      const [statusResponse, usageResponse] = await Promise.all([
        subscriptionApi.get('/api/subscription/status'),
        subscriptionApi.get('/api/subscription/usage')
      ]);

      if (statusResponse.data.success) {
        setSubscription(statusResponse.data.data);
      }

      if (usageResponse.data.success) {
        setUsage(usageResponse.data.data);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (plan) => {
    setActionLoading(true);
    try {
      const response = await subscriptionApi.post('/api/subscription/checkout', { plan });

      if (response.data.success && response.data.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      showError(err, 'NETWORK_ERROR');
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await subscriptionApi.post('/api/subscription/portal');

      if (response.data.success && response.data.data.url) {
        // Open Stripe customer portal in new tab
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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await subscriptionApi.post('/api/subscription/cancel');

      if (response.data.success) {
        // Show success message using structured format
        const successMsg = getErrorMessage('Subscription will be cancelled at the end of the current period. You can reactivate it anytime before then.', 'VALIDATION_ERROR');
        alert(successMsg);
        // Reload subscription data to reflect the change
        await loadSubscriptionData();
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      showError(err, 'NETWORK_ERROR');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await subscriptionApi.post('/api/subscription/reactivate');

      if (response.data.success) {
        // Show success message
        alert('Subscription reactivated successfully! Your subscription is now active.');
        // Reload subscription data to reflect the change
        await loadSubscriptionData();
      }
    } catch (err) {
      console.error('Failed to reactivate subscription:', err);
      showError(err, 'NETWORK_ERROR');
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return html`
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading subscription information...</p>
        </div>
      </div>
    `;
  }

  // Show error state
  if (error) {
    return html`
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 text-center">
          <i className="fa-solid fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h3 className="text-xl font-black text-red-800 mb-2">Error Loading Subscription</h3>
          <p className="text-red-600 mb-6">${error}</p>
          <button
            onClick=${loadSubscriptionData}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            <i className="fa-solid fa-refresh mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    `;
  }

  const isCancelled = subscription?.cancelAtPeriodEnd || subscription?.status === 'CANCELED';
  const canCancel = subscription?.status === 'ACTIVE' && !subscription?.cancelAtPeriodEnd;
  const canReactivate = isCancelled;

  return html`
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Subscription Management</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage your subscription, billing, and usage</p>
        </div>
        ${subscription && html`
          <${PlanBadge}
            plan=${subscription.plan}
            status=${subscription.status?.toLowerCase() || 'active'}
            size="lg"
          />
        `}
      </div>

      ${confirmationStatus === 'processing' && html`
        <div className="bg-blue-50 border border-blue-200 rounded-[2.5rem] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-800 font-medium">Activating your PayPal subscription...</p>
          </div>
        </div>
      `}

      ${confirmationStatus === 'success' && html`
        <div className="bg-emerald-50 border border-emerald-200 rounded-[2.5rem] p-6">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-check-circle text-emerald-600 text-xl"></i>
            <div>
              <p className="text-emerald-800 font-black">Subscription Activated Successfully!</p>
              <p className="text-emerald-700 text-sm">Your PayPal subscription is now active.</p>
            </div>
          </div>
        </div>
      `}

      ${confirmationStatus === 'error' && error && html`
        <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-6">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-exclamation-circle text-red-600 text-xl"></i>
            <div>
              <p className="text-red-800 font-black">Subscription Activation Failed</p>
              <p className="text-red-700 text-sm">${error}</p>
            </div>
          </div>
        </div>
      `}

      ${subscription && html`
        <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-6 ${!isCancelled ? 'hidden' : ''}">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fa-solid fa-exclamation-triangle text-amber-600 text-xl"></i>
              <div>
                <p className="font-black text-amber-800">Subscription Cancelled</p>
                <p className="text-sm text-amber-700">
                  Your subscription will remain active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            ${canReactivate && html`
              <button
                onClick=${handleReactivateSubscription}
                disabled=${actionLoading}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50 transition-all"
              >
                ${actionLoading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
                Reactivate
              </button>
            `}
          </div>
        </div>
      `}

      ${(() => {
        if (!usage) return null;

        // Check all features for quota warnings (>= 90%)
        const features = [
          { key: 'articles', name: 'Articles' },
          { key: 'images', name: 'Images' },
          { key: 'videos', name: 'Videos' },
          { key: 'research', name: 'Research Queries' },
          { key: 'wordpress', name: 'WordPress Publications' }
        ];

        const warnings = features
          .map(f => {
            const quotaCheck = checkFeatureQuota(usage, f.key);
            const message = getQuotaWarningMessage(quotaCheck, f.name);
            return message ? { feature: f.name, message, exceeded: quotaCheck.exceeded, percentage: quotaCheck.percentage } : null;
          })
          .filter(Boolean);

        if (warnings.length === 0) return null;

        return html`
          <div className="bg-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-50 border border-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-200 rounded-[2.5rem] p-6">
            <div className="flex items-start space-x-3">
              <i className="fa-solid fa-exclamation-triangle text-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-600 text-xl mt-1"></i>
              <div className="flex-1">
                <p className="font-black text-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-800 mb-2">
                  ${warnings.some(w => w.exceeded) ? 'Quota Limit Reached' : 'Quota Warning'}
                </p>
                <div className="space-y-2">
                  ${warnings.map(warning => html`
                    <p className="text-sm text-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-700">
                      ${warning.message}
                    </p>
                  `)}
                </div>
                <div className="mt-4">
                  <button
                    onClick=${() => setShowUpgradeModal(true)}
                    className="px-6 py-2 bg-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-${warnings.some(w => w.exceeded) ? 'red' : 'amber'}-700 transition-all"
                  >
                    <i className="fa-solid fa-arrow-up mr-2"></i>
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          ${subscription && html`
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">Current Subscription</h3>
                <${PlanBadge} plan=${subscription.plan} status=${subscription.status?.toLowerCase()} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Plan</span>
                  <span className="text-sm font-black text-slate-800 uppercase">${subscription.plan}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Status</span>
                  <span className=${`text-sm font-black uppercase ${
                    subscription.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    ${subscription.status}
                  </span>
                </div>

                ${subscription.currentPeriodEnd && html`
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-500">Next Billing Date</span>
                    <span className="text-sm font-black text-slate-800">
                      ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                `}

                ${subscription.cancelAtPeriodEnd && html`
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-800">
                      <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                      Your subscription will be cancelled at the end of the billing period.
                    </p>
                  </div>
                `}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                ${subscription.plan !== 'ENTERPRISE' && html`
                  <button
                    onClick=${() => setShowUpgradeModal(true)}
                    disabled=${actionLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <i className="fa-solid fa-arrow-up mr-2"></i> Change Plan
                  </button>
                `}

                <button
                  onClick=${handleManageSubscription}
                  disabled=${actionLoading}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50 transition-all"
                >
                  ${actionLoading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-credit-card mr-2"></i>`}
                  Manage Subscription
                </button>

                ${canCancel && html`
                  <button
                    onClick=${handleCancelSubscription}
                    disabled=${actionLoading}
                    className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-200 disabled:opacity-50 transition-all"
                  >
                    ${actionLoading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-times mr-2"></i>`}
                    Cancel Subscription
                  </button>
                `}
              </div>
            </div>
          `}

          ${usage && html`<${UsageStats} usage=${usage} />`}
        </div>

        <div className="lg:col-span-1">
          ${subscription && html`
            <${PlanComparison}
              currentPlan=${subscription.plan || 'FREE'}
              onUpgrade=${() => setShowUpgradeModal(true)}
            />
          `}
        </div>
      </div>

      ${showUpgradeModal && html`
        <${UpgradeModal}
          currentPlan=${subscription?.plan || 'FREE'}
          onClose=${() => setShowUpgradeModal(false)}
          onUpgrade=${handleChangePlan}
        />
      `}
    </div>
  `;
};

export default Subscription;

