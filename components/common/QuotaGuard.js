import React from 'react';
import htm from 'htm';
import { useQuota } from '../../hooks/useQuota.js';
import { checkFeatureQuota, getQuotaWarningMessage } from '../../utils/quotaChecker.js';

const html = htm.bind(React.createElement);

/**
 * QuotaGuard Component
 * Wraps a button/action and checks quota before allowing it
 * 
 * @param {Object} props
 * @param {string} props.feature - Feature name ('articles', 'images', 'videos', 'research', 'wordpress')
 * @param {string} props.featureName - Display name for the feature (defaults to feature)
 * @param {React.ReactNode} props.children - Button/action to wrap
 * @param {Function} props.onClick - Click handler (will be blocked if quota exceeded)
 * @param {boolean} props.showWarning - Show warning message if quota warning (default: true)
 */
const QuotaGuard = ({ 
  feature, 
  featureName, 
  children, 
  onClick, 
  showWarning = true,
  ...buttonProps 
}) => {
  const { usage, loading: quotaLoading } = useQuota();
  
  const quotaCheck = usage ? checkFeatureQuota(usage, feature) : {
    allowed: false,
    warning: false,
    exceeded: false,
    loading: true
  };
  
  const displayName = featureName || feature.charAt(0).toUpperCase() + feature.slice(1);
  const warningMessage = quotaCheck.warning || quotaCheck.exceeded 
    ? getQuotaWarningMessage(quotaCheck, displayName)
    : null;

  const handleClick = (e) => {
    if (!quotaCheck.allowed || quotaLoading) {
      e.preventDefault();
      e.stopPropagation();
      
      if (quotaCheck.exceeded) {
        alert(`You have reached your ${displayName} quota limit. Please upgrade your plan to continue.`);
      } else if (quotaCheck.warning) {
        alert(warningMessage);
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const isDisabled = buttonProps.disabled || !quotaCheck.allowed || quotaLoading;

  return html`
    <div className="quota-guard-wrapper">
      ${showWarning && warningMessage && html`
        <div className="mb-3 bg-${quotaCheck.exceeded ? 'red' : 'amber'}-50 border border-${quotaCheck.exceeded ? 'red' : 'amber'}-200 rounded-xl p-3">
          <p className="text-xs text-${quotaCheck.exceeded ? 'red' : 'amber'}-700 font-medium">
            <i className="fa-solid fa-exclamation-triangle mr-2"></i>
            ${warningMessage}
          </p>
        </div>
      `}
      ${React.cloneElement(children, {
        ...buttonProps,
        disabled: isDisabled,
        onClick: handleClick,
        title: quotaCheck.exceeded 
          ? `Quota exceeded. Upgrade to continue using ${displayName}.`
          : quotaCheck.warning
          ? warningMessage
          : buttonProps.title
      })}
    </div>
  `;
};

export default QuotaGuard;
