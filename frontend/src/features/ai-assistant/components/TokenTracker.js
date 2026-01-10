import React, { useState, useEffect } from 'react';
import { useQuota } from '@/hooks';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * TokenTracker Component
 * Displays real-time token usage tracker in the chat footer
 * 
 * @param {number} sessionTokens - Number of tokens used in this session (passed from parent)
 */
const TokenTracker = ({ sessionTokens = 0 }) => {
  const { usage, loading, refresh } = useQuota();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Refresh usage data periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refresh]);

  if (loading || !usage) {
    return html`
      <div className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[10px] text-slate-500 font-medium">
        <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
        Loading...
      </div>
    `;
  }

  const tokenData = usage.tokens || { used: 0, limit: 0, remaining: 0 };
  const monthlyUsed = tokenData.used || 0;
  const monthlyLimit = tokenData.limit || 0;
  const planName = usage.plan || 'Free';

  // Calculate total usage (monthly + session)
  const totalUsed = monthlyUsed + sessionTokens;
  const effectiveLimit = monthlyLimit === -1 ? -1 : monthlyLimit;
  
  // Calculate percentage
  const percentage = effectiveLimit === -1 
    ? 0 
    : monthlyLimit === 0 
      ? 100 
      : Math.min(100, Math.round((totalUsed / monthlyLimit) * 100));

  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage >= 90) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    if (percentage >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' };
  };

  const colors = getColorClass();

  // Check if upgrade prompt should be shown
  useEffect(() => {
    if (percentage >= 90 && monthlyLimit !== -1) {
      setShowUpgradePrompt(true);
    } else {
      setShowUpgradePrompt(false);
    }
  }, [percentage, monthlyLimit]);

  // Format number with commas
  const formatNumber = (num) => {
    if (num === -1) return 'Unlimited';
    if (num === 0) return '0';
    return num.toLocaleString('en-US');
  };

  // Format tokens for display (e.g., 2.35K, 1.5M)
  const formatTokens = (num) => {
    if (num === -1) return 'Unlimited';
    if (num === 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-US');
  };

  const tooltipText = monthlyLimit === -1
    ? `You've used ${formatTokens(totalUsed)} tokens this month. Plan: ${planName} (Unlimited)`
    : `You've used ${formatTokens(totalUsed)} of ${formatTokens(monthlyLimit)} tokens this month (${formatTokens(sessionTokens)} this session). Plan: ${planName}`;

  return html`
    <div className="relative">
      <div 
        className=${`px-2 sm:px-3 py-1.5 bg-slate-800/50 border ${colors.border} rounded-lg transition-all cursor-pointer hover:bg-slate-800 hover:border-opacity-50 ${
          isExpanded ? 'border-opacity-70' : ''
        }`}
        onClick=${() => setIsExpanded(!isExpanded)}
        onMouseEnter=${() => setIsExpanded(true)}
        onMouseLeave=${() => setIsExpanded(false)}
        title=${tooltipText}
      >
        <div className="flex items-center space-x-2">
          <!-- Lightning Icon -->
          <i className=${`fa-solid fa-bolt ${colors.text} text-xs`}></i>
          
          ${!isExpanded ? html`
            <!-- Condensed View -->
            <div className="flex items-center space-x-1.5">
              <span className=${`text-[10px] ${colors.text} font-bold`}>
                ${formatTokens(totalUsed)}
              </span>
              ${monthlyLimit !== -1 && html`
                <span className="text-[9px] text-slate-500 font-medium">
                  / ${formatTokens(monthlyLimit)}
                </span>
              `}
            </div>
            
            <!-- Mini Progress Bar -->
            ${monthlyLimit !== -1 && html`
              <div className="w-12 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className=${`h-full ${colors.bg} transition-all duration-500 ease-out`}
                  style=${{ width: `${Math.min(100, percentage)}%` }}
                ></div>
              </div>
            `}
          ` : html`
            <!-- Expanded View -->
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-2">
                  <span className=${`text-[10px] ${colors.text} font-bold`}>
                    ${formatTokens(totalUsed)}
                  </span>
                  ${monthlyLimit !== -1 && html`
                    <span className="text-[9px] text-slate-500 font-medium">
                      / ${formatTokens(monthlyLimit)} tokens
                    </span>
                  `}
                </div>
                <span className="text-[9px] text-slate-500 font-medium uppercase">
                  ${planName} Plan
                </span>
              </div>
              
              ${monthlyLimit !== -1 && html`
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className=${`h-full ${colors.bg} transition-all duration-500 ease-out`}
                    style=${{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              `}
              
              ${sessionTokens > 0 && html`
                <div className="text-[9px] text-slate-400 font-medium">
                  ${formatTokens(sessionTokens)} tokens this session
                </div>
              `}
              
              ${monthlyLimit !== -1 && html`
                <div className="text-[9px] ${colors.text} font-medium">
                  ${percentage}% used • ${formatTokens(Math.max(0, monthlyLimit - totalUsed))} remaining
                </div>
              `}
            </div>
          `}
        </div>
      </div>

      <!-- Upgrade Prompt (when 90%+) -->
      ${showUpgradePrompt && monthlyLimit !== -1 && html`
        <div className="absolute bottom-full right-0 mb-2 w-56 sm:w-64 p-3 bg-yellow-900/90 border border-yellow-500/50 rounded-lg shadow-lg z-50 animate-fadeIn max-w-[calc(100vw-2rem)]">
          <div className="flex items-start space-x-2">
            <i className="fa-solid fa-exclamation-triangle text-yellow-400 mt-0.5 flex-shrink-0"></i>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-yellow-300 mb-1">
                Approaching Token Limit
              </div>
              <div className="text-[10px] text-yellow-200/90 mb-2">
                You've used ${percentage}% of your monthly token limit. Consider upgrading your plan for more tokens.
              </div>
              <button
                onClick=${(e) => {
                  e.stopPropagation();
                  // Navigate to billing page using React Router if available, otherwise use window.location
                  if (window.location.pathname !== '/account/billing') {
                    window.location.href = '/account/billing';
                  }
                }}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all w-full sm:w-auto"
              >
                Upgrade Plan
              </button>
            </div>
            <button
              onClick=${(e) => {
                e.stopPropagation();
                setShowUpgradePrompt(false);
              }}
              className="text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0"
            >
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>
        </div>
      `}
    </div>
  `;
};

export default TokenTracker;