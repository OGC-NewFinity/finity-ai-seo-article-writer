import React from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';

const html = htm.bind(React.createElement);

const SettingsPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return html`
    <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 max-w-3xl mx-auto animate-fadeIn shadow-xl shadow-black/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Settings</h2>
        <p className="text-slate-400 font-medium">Manage your personal settings and preferences.</p>
      </div>
      
      <${OnboardingBanner}
        id="settings-welcome"
        title="Welcome to Settings!"
        message="Personal settings have been moved to your Account Dashboard. System and provider configurations are available to administrators only."
        icon="fa-sliders"
        type="info"
      />
      
      <div className="space-y-6 pt-6">
        <!-- User Settings Redirect -->
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3">Personal Settings</h3>
          <p className="text-slate-400 text-sm mb-4">
            Manage your profile, preferences, and account settings from the Account Dashboard.
          </p>
          <button 
            onClick=${() => navigate('/account/profile')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-user-circle mr-2"></i>
            Go to Account Dashboard
          </button>
        </div>

        <!-- Admin Settings (Admin Only) -->
        ${isAdmin && html`
          <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-700/50">
            <h3 className="text-lg font-bold text-white mb-3">
              <i className="fa-solid fa-shield-halved mr-2 text-blue-400"></i>
              Admin: System Configuration
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Configure AI providers, API keys, and system-wide settings. These settings affect all users.
            </p>
            <button 
              onClick=${() => navigate('/admin/settings')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <i className="fa-solid fa-cog mr-2"></i>
              Open Admin Settings
            </button>
          </div>
        `}

        <!-- Non-admin message -->
        ${!isAdmin && html`
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 text-center">
            <i className="fa-solid fa-info-circle text-slate-400 text-2xl mb-3"></i>
            <p className="text-slate-400 text-sm">
              System and provider settings are managed by administrators only.
            </p>
          </div>
        `}
      </div>
    </div>
  `;
};

export default SettingsPanel;
