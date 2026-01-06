import React, { useState } from 'react';
import htm from 'htm';
import subscriptionApi from '../../services/subscriptionApi.js';

const html = htm.bind(React.createElement);

const UpgradeModal = ({ currentPlan, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayPalCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a plan first');
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
      setError(err.response?.data?.error?.message || 'Failed to start PayPal checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a plan first');
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
        // Fallback for other uses (like AccountPage)
        alert(`Stripe checkout is currently unavailable. Please use PayPal.`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      setError('Failed to start checkout process. Please try again.');
      setLoading(false);
    }
  };

  const availablePlans = currentPlan === 'FREE' 
    ? ['PRO', 'ENTERPRISE']
    : ['ENTERPRISE'];

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
          ${availablePlans.map(plan => {
            const isSelected = selectedPlan === plan;
            const isPro = plan === 'PRO';
            
            return html`
              <div
                key=${plan}
                onClick=${() => setSelectedPlan(plan)}
                className=${`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isPro ? 'relative' : ''}`}
              >
                ${isPro && html`
                  <div className="absolute top-4 right-4 text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2 py-1 rounded">
                    Popular
                  </div>
                `}
                
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black text-slate-800">${plan}</h4>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-slate-800">
                      ${plan === 'PRO' ? '$29' : '$99'}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">/month</span>
                  </div>
                </div>
                
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
            disabled=${true}
            className="w-full px-6 py-3 bg-slate-300 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed transition-all flex items-center justify-center opacity-50"
            title="Stripe checkout coming soon"
          >
            <i className="fa-solid fa-credit-card mr-2"></i>
            Subscribe with Stripe (Coming Soon)
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
