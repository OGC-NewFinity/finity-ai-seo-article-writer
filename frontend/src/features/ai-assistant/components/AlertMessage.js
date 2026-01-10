import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * AlertMessage Component
 * Displays warning/confirmation/info messages with optional retry functionality
 */
const AlertMessage = ({ message, onRetry }) => {
  const { alertType = 'info', title, content, retryable } = message.content || {};
  const canRetry = retryable !== false && onRetry && message.error;
  
  const getAlertStyles = (type) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          icon: 'fa-triangle-exclamation',
          iconColor: 'text-yellow-400',
          textColor: 'text-yellow-300'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: 'fa-circle-exclamation',
          iconColor: 'text-red-400',
          textColor: 'text-red-300'
        };
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          icon: 'fa-circle-check',
          iconColor: 'text-green-400',
          textColor: 'text-green-300'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          icon: 'fa-circle-info',
          iconColor: 'text-blue-400',
          textColor: 'text-blue-300'
        };
    }
  };

  const styles = getAlertStyles(alertType);

  return html`
    <div className=${`${styles.bg} rounded-xl p-4 border ${styles.border}`}>
      <div className="flex items-start space-x-3">
        <i className=${`fa-solid ${styles.icon} ${styles.iconColor} text-lg mt-0.5`}></i>
        <div className="flex-1">
          ${title && html`
            <div className=${`font-bold text-sm mb-1 ${styles.textColor}`}>
              ${title}
            </div>
          `}
          <div className=${`text-sm font-medium ${styles.textColor} whitespace-pre-wrap mb-3`}>
            ${content || message.content}
          </div>
          ${canRetry && html`
            <button
              onClick=${() => onRetry && onRetry(message)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all border border-slate-600 flex items-center space-x-2"
            >
              <i className="fa-solid fa-arrow-rotate-right"></i>
              <span>Retry</span>
            </button>
          `}
        </div>
      </div>
    </div>
  `;
};

export default AlertMessage;
