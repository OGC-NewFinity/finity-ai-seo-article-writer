import React, { useState, useEffect } from 'react';
import htm from 'htm';
import SubscriptionCard from './SubscriptionCard.js';
import { UsageStats, PlanComparison, UpgradeModal } from '@/features/account';
import PlanBadge from '@/components/common/PlanBadge.js';

const html = htm.bind(React.createElement);

const AccountPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const [subRes, usageRes] = await Promise.all([
      //   fetch('/api/subscription/status'),
      //   fetch('/api/subscription/usage')
      // ]);
      // const subData = await subRes.json();
      // const usageData = await usageRes.json();
      
      // Mock data for now
      setSubscription({
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      setUsage({
        plan: 'FREE',
        articles: { used: 3, limit: 10, remaining: 7 },
        images: { used: 8, limit: 25, remaining: 17 },
        videos: { used: 0, limit: 0, remaining: 0 },
        research: { used: 12, limit: 20, remaining: 8 },
        wordpress: { used: 0, limit: 0, remaining: 0 }
      });
    } catch (error) {
      console.error('Failed to load account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return html`
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;
  }

  return html`
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account & Billing</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage your subscription and usage</p>
        </div>
        ${subscription && html`<${PlanBadge} plan=${subscription.plan} status=${subscription.status.toLowerCase()} size="lg" />`}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <${SubscriptionCard} 
            subscription=${subscription} 
            onUpgrade=${() => setShowUpgradeModal(true)}
          />
          
          ${usage && html`<${UsageStats} usage=${usage} />`}
        </div>

        <div className="lg:col-span-1">
          <${PlanComparison} 
            currentPlan=${subscription?.plan || 'FREE'}
            onUpgrade=${() => setShowUpgradeModal(true)}
          />
        </div>
      </div>

      ${showUpgradeModal && html`
        <${UpgradeModal} 
          currentPlan=${subscription?.plan || 'FREE'}
          onClose=${() => setShowUpgradeModal(false)}
        />
      `}
    </div>
  `;
};

export default AccountPage;
