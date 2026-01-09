import React from 'react';
import htm from 'htm';
import PlanBadge from '../common/PlanBadge.js';

const html = htm.bind(React.createElement);

const SubscriptionCard = ({ subscription, onUpgrade }) => {
  if (!subscription) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return html`
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl shadow-black/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-white">Current Subscription</h3>
        <${PlanBadge} plan=${subscription.plan} status=${subscription.status.toLowerCase()} />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-slate-800">
          <span className="text-sm font-bold text-slate-400">Plan</span>
          <span className="text-sm font-black text-white uppercase">${subscription.plan}</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800">
          <span className="text-sm font-bold text-slate-400">Status</span>
          <span className=${`text-sm font-black uppercase ${
            subscription.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            ${subscription.status}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-slate-800">
          <span className="text-sm font-bold text-slate-400">Next Billing Date</span>
          <span className="text-sm font-black text-white">${formatDate(subscription.currentPeriodEnd)}</span>
        </div>

        ${subscription.cancelAtPeriodEnd && html`
          <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-300">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              Your subscription will be cancelled at the end of the billing period.
            </p>
          </div>
        `}
      </div>

      <div className="mt-8 flex space-x-4">
        ${subscription.plan !== 'ENTERPRISE' && html`
          <button
            onClick=${onUpgrade}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <i className="fa-solid fa-arrow-up mr-2"></i> Upgrade Plan
          </button>
        `}
        
        <button
          onClick=${() => {
            // TODO: Open Stripe portal
            window.open('/api/subscription/portal', '_blank');
          }}
          className="flex-1 px-6 py-3 bg-slate-800 text-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
        >
          <i className="fa-solid fa-credit-card mr-2"></i> Manage Billing
        </button>
      </div>
    </div>
  `;
};

export default SubscriptionCard;
