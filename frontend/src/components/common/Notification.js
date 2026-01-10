import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-emerald-500 text-white border-emerald-600',
    error: 'bg-red-500 text-white border-red-600',
    warning: 'bg-amber-500 text-white border-amber-600',
    info: 'bg-blue-500 text-white border-blue-600'
  };

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  if (!visible) return null;

  return html`
    <div 
      className=${`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-2xl shadow-2xl border-2 ${typeStyles[type]} transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style=${{ minWidth: '300px', maxWidth: '500px' }}
    >
      <div className="flex items-center space-x-3">
        <i className=${`fa-solid ${icons[type]} text-xl`}></i>
        <p className="flex-1 font-bold text-sm">${message}</p>
        <button
          onClick=${() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-4 hover:opacity-70 transition-opacity"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `;
};

// Notification Manager Component
export const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for notification events
    const handleNotification = (event) => {
      const { message, type, duration } = event.detail;
      addNotification(message, type, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Expose function globally
  useEffect(() => {
    window.showNotification = (message, type, duration) => {
      const event = new CustomEvent('showNotification', {
        detail: { message, type, duration }
      });
      window.dispatchEvent(event);
    };
  }, []);

  return html`
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      ${notifications.map(notif => html`
        <${Notification}
          key=${notif.id}
          message=${notif.message}
          type=${notif.type}
          duration=${notif.duration}
          onClose=${() => removeNotification(notif.id)}
        />
      `)}
    </div>
  `;
};

export default Notification;
