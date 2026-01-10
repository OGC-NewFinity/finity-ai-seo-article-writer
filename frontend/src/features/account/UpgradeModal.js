import React, { useState } from 'react';
import htm from 'htm';
import subscriptionApi from '@/services/subscriptionApi.js';
import { getErrorMessage } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

// Unified plan configuration (matches backend unifiedPlans.js)
const UNIFIED_PLANS = {
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    price: '$29',
    pricePeriod: '/month',
    features: [
      '100 articles/month',
      '500 images/month',
      '20 videos/month',
      'Unlimited research',
      '50 WordPress publications',
      'Advanced SEO features',
      'High-quality content',
      'API access',
      'Priority support'
    ],
    popular: true
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$99',
    pricePeriod: '/month',
    features: [
      'Unlimited articles',
      'Unlimited images',
      '100 videos/month',
      'Unlimited research',
      'Unlimited publications',
      'All advanced features',
      'Highest quality',
      'Full API access',
      'Custom integrations',
      'Dedicated support'
    ]
  }
};

const UpgradeModal = ({ currentPlan, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayPalCheckout = async () => {
    if (!selectedPlan) {
      setError(getErrorMessage('Please select a plan first', 'VALIDATION_ERROR'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await subscriptionApi.post('/api/subscription/paypal/checkout', {
        plan: selectedPlan
      });

      if (response.data.success && response.data.data.approvalUrl) {
        // Redirect to PayPal approval URL
        window.location.href = response.data.data.approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }
    } catch (err) {
      console.error('PayPal checkout failed:', err);
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) {
      setError(getErrorMessage('Please select a plan first', 'VALIDATION_ERROR'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // If onUpgrade prop is provided, use it (from Subscription page - Stripe)
      if (onUpgrade) {
        await onUpgrade(selectedPlan);
        onClose();
      } else {
        // Fallback: create Stripe checkout session directly
        const response = await subscriptionApi.post('/api/subscription/checkout', {
          plan: selectedPlan
        });

        if (response.data.success && response.data.data.url) {
          // Redirect to Stripe checkout
          window.location.href = response.data.data.url;
        } else {
          throw new Error('No checkout URL received from Stripe');
        }
      }
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      setError(getErrorMessage(error, 'NETWORK_ERROR'));
      setLoading(false);
    }
  };

  // Get available plans based on current plan
  const getAvailablePlans = () => {
    const currentTier = currentPlan?.toUpperCase() || 'FREE';
    switch (currentTier) {
      case 'FREE':
        return ['PRO', 'ENTERPRISE'];
      case 'PRO':
        return ['ENTERPRISE'];
      case 'ENTERPRISE':
        return [];
      default:
        return ['PRO', 'ENTERPRISE'];
    }
  };

  const availablePlans = getAvailablePlans();

  return html`
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-800">Upgrade Your Plan</h3>
          <button
            onClick=${onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-4 mb-8">
          ${availablePlans.map(planTier => {
            const isSelected = selectedPlan === planTier;
            const plan = UNIFIED_PLANS[planTier];
            
            if (!plan) return null;

            return html`
              <div
                key=${planTier}
                onClick=${() => setSelectedPlan(planTier)}
                className=${`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${plan.popular ? 'relative' : ''}`}
              >
                ${plan.popular && html`
                  <div className="absolute top-4 right-4 text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2 py-1 rounded">
                    Popular
                  </div>
                `}

                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black text-slate-800">${plan.name}</h4>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-slate-800">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">${plan.pricePeriod || '/month'}</span>
                  </div>
                </div>

                ${plan.features && plan.features.length > 0 && html`
                  <div className="mb-4 space-y-1">
                    ${plan.features.slice(0, 3).map((feature, idx) => html`
                      <div key=${idx} className="flex items-center space-x-2 text-xs text-slate-600">
                        <i className="fa-solid fa-check text-emerald-500"></i>
                        <span>${feature}</span>
                      </div>
                    `)}
                    ${plan.features.length > 3 && html`
                      <div className="text-xs text-slate-500 ml-5">
                        +${plan.features.length - 3} more features
                      </div>
                    `}
                  </div>
                `}

                <div className="flex items-center space-x-2">
                  <div className=${`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    ${isSelected && html`
                      <i className="fa-solid fa-check text-white text-xs"></i>
                    `}
                  </div>
                  <span className="text-sm text-slate-600">Select this plan</span>
                </div>
              </div>
            `;
          })}
        </div>

        ${error && html`
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">${error}</p>
          </div>
        `}

        <div className="flex flex-col space-y-3">
          <button
            onClick=${handlePayPalCheckout}
            disabled=${!selectedPlan || loading}
            className="w-full px-6 py-3 bg-[#0070ba] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005ea6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-brands fa-paypal mr-2"></i>`}
            Subscribe with PayPal
          </button>

          <button
            onClick=${handleStripeCheckout}
            disabled=${!selectedPlan || loading}
            className="w-full px-6 py-3 bg-[#635BFF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5851EA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-credit-card mr-2"></i>`}
            Subscribe with Stripe
          </button>

          <button
            onClick=${onClose}
            className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;
};

export default UpgradeModal;

