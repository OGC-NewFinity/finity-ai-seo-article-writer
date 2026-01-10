import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const PlanBadge = ({ plan, status = 'active', size = 'md' }) => {
  const planConfig = {
    FREE: {
      label: 'Free',
      color: 'bg-slate-700 text-slate-200',
      icon: 'fa-tag'
    },
    PRO: {
      label: 'Pro',
      color: 'bg-blue-600 text-white',
      icon: 'fa-star'
    },
    ENTERPRISE: {
      label: 'Enterprise',
      color: 'bg-purple-600 text-white',
      icon: 'fa-crown'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[9px]',
    md: 'px-3 py-1.5 text-[10px]',
    lg: 'px-4 py-2 text-xs'
  };

  const config = planConfig[plan] || planConfig.FREE;

  return html`
    <span className=${`inline-flex items-center space-x-1.5 ${config.color} ${sizeClasses[size]} rounded-full font-black uppercase tracking-widest`}>
      <i className=${`fa-solid ${config.icon}`}></i>
      <span>${config.label}</span>
      ${status === 'expired' && html`<i className="fa-solid fa-exclamation-circle text-red-300"></i>`}
      ${status === 'cancelled' && html`<i className="fa-solid fa-xmark text-slate-300"></i>`}
    </span>
  `;
};

export default PlanBadge;
