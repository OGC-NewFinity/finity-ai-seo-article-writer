import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * OnboardingBanner Component
 * Dismissible welcome banner for first-time visitors
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for this banner (used for localStorage)
 * @param {string} props.title - Banner title
 * @param {string} props.message - Banner message/content
 * @param {string} props.icon - FontAwesome icon class (e.g., 'fa-info-circle')
 * @param {string} props.type - Banner type: 'info', 'success', 'warning' (affects colors)
 */
const OnboardingBanner = ({ id, title, message, icon = 'fa-info-circle', type = 'info' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storageKey = `nova-xfinity-onboarding-${id}`;
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    const storageKey = `nova-xfinity-onboarding-${id}`;
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  const typeStyles = {
    info: 'bg-blue-900/30 border-blue-700 text-blue-300',
    success: 'bg-emerald-900/30 border-emerald-700 text-emerald-300',
    warning: 'bg-amber-900/30 border-amber-700 text-amber-300'
  };

  if (!isVisible) return null;

  return html`
    <div className=${`mb-8 p-5 rounded-2xl border ${typeStyles[type]} animate-fadeIn`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
            <i className=${`fa-solid ${icon} text-lg text-blue-400`}></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white mb-1">${title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed">${message}</p>
          </div>
        </div>
        <button
          onClick=${handleDismiss}
          className="ml-4 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>
    </div>
  `;
};

export default OnboardingBanner;
