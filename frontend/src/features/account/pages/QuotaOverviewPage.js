import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import { useQuota } from '@/hooks';
import subscriptionApi from '@/services/subscriptionApi';
import { getErrorMessage } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const QuotaOverviewPage = () => {
  const navigate = useNavigate();
  const { usage, loading, error } = useQuota();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionApi.get('/api/subscription/status');
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const calculatePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const getUsageTextColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-blue-600';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return html`
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading quota information...</p>
        </div>
      </div>
    `;
  }

  if (error) {
    return html`
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <i className="fa-solid fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Quota</h3>
        <p className="text-red-600">${error}</p>
      </div>
    `;
  }

  const features = [
    {
      key: 'articles',
      name: 'Articles',
      icon: 'fa-file-lines',
      description: 'AI-generated articles'
    },
    {
      key: 'images',
      name: 'Images',
      icon: 'fa-image',
      description: 'Generated images'
    },
    {
      key: 'videos',
      name: 'Videos',
      icon: 'fa-video',
      description: 'Generated videos'
    },
    {
      key: 'research',
      name: 'Research Queries',
      icon: 'fa-microscope',
      description: 'Research lab queries'
    },
    {
      key: 'wordpress',
      name: 'WordPress Publications',
      icon: 'fa-wordpress',
      description: 'Published to WordPress'
    }
  ];

  // Calculate overall token usage
  const totalTokens = usage?.totalTokens || { used: 0, limit: 0 };
  const overallPercentage = calculatePercentage(totalTokens.used, totalTokens.limit);

  return html`
    <div className="space-y-8 animate-fadeIn">
      <!-- Page Header -->
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quota Overview</h1>
          <p className="text-gray-500 mt-2">Monitor your usage and plan limits</p>
        </div>
        ${subscription?.plan !== 'ENTERPRISE' && html`
          <button
            onClick=${() => navigate('/account/billing')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-up mr-2"></i>
            Upgrade Plan
          </button>
        `}
      </div>

      <!-- Overall Token Usage Card -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Token Usage</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Usage</span>
            <span className=${`text-lg font-black ${getUsageTextColor(overallPercentage)}`}>
              ${formatNumber(totalTokens.used)} / ${formatNumber(totalTokens.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className=${`h-full ${getUsageColor(overallPercentage)} transition-all duration-500 rounded-full`}
              style=${{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ${totalTokens.remaining || 0} tokens remaining this month
          </p>
        </div>

        ${subscription && html`
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Plan</p>
                <p className="text-lg font-black text-gray-900 uppercase">${subscription.plan || 'FREE'}</p>
              </div>
              ${subscription.plan !== 'ENTERPRISE' && html`
                <button
                  onClick=${() => navigate('/account/billing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Upgrade
                </button>
              `}
            </div>
          </div>
        `}
      </div>

      <!-- Feature Breakdown -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Usage by Feature</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${features.map((feature) => {
            const featureUsage = usage?.[feature.key] || { used: 0, limit: 0, remaining: 0 };
            const percentage = calculatePercentage(featureUsage.used, featureUsage.limit);
            const isUnlimited = featureUsage.limit === 0 || featureUsage.limit === null;

            return html`
              <div key=${feature.key} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <i className=${`fa-solid ${feature.icon} text-blue-600`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">${feature.name}</h3>
                      <p className="text-xs text-gray-500">${feature.description}</p>
                    </div>
                  </div>
                </div>

                ${isUnlimited ? html`
                  <div className="text-center py-4">
                    <p className="text-2xl font-black text-gray-900">${formatNumber(featureUsage.used)}</p>
                    <p className="text-xs text-gray-500 mt-1">Unlimited</p>
                  </div>
                ` : html`
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Usage</span>
                      <span className=${`text-sm font-black ${getUsageTextColor(percentage)}`}>
                        ${formatNumber(featureUsage.used)} / ${formatNumber(featureUsage.limit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className=${`h-full ${getUsageColor(percentage)} transition-all duration-500 rounded-full`}
                        style=${{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ${featureUsage.remaining || 0} remaining
                    </p>
                  </div>
                `}

                ${percentage >= 90 && !isUnlimited && html`
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-800">
                      <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                      ${percentage >= 100 ? 'Limit reached' : 'Approaching limit'}
                    </p>
                  </div>
                `}
              </div>
            `;
          })}
        </div>
      </div>

      <!-- Usage Tips -->
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center">
          <i className="fa-solid fa-lightbulb mr-2"></i>
          Usage Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Token usage resets at the beginning of each billing cycle</li>
          <li>• Upgrade to a higher plan to increase your limits</li>
          <li>• Contact support if you need custom quota limits</li>
          <li>• Monitor your usage regularly to avoid hitting limits</li>
        </ul>
      </div>
    </div>
  `;
};

export default QuotaOverviewPage;
