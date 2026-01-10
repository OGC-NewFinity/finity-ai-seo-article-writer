import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useAuth } from '@/hooks';
import api from '@/services/api';
import { PROVIDER_OPTIONS } from '@/constants.js';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';
import Tooltip from '@/components/common/Tooltip.js';
import { getErrorMessage, showError } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const AdminSettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    provider: 'gemini',
    // SECURITY: API keys are never stored in frontend state
    // Only store masked indicators from backend
    hasOpenAIKey: false,
    hasClaudeKey: false,
    hasLlamaKey: false,
    focusKeyphrase: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      window.location.href = '/unauthorized';
    }
  }, [user, isAdmin]);

  // Load admin settings from backend
  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/settings');
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        // SECURITY: Only store safe data, never API keys
        // Remove any keys that might have been accidentally returned
        const { openaiKey, claudeKey, llamaKey, ...safeData } = data;
        setSettings(prev => ({
          ...prev,
          ...safeData,
          // Store only boolean indicators, not actual keys
          hasOpenAIKey: data.hasOpenAIKey || false,
          hasClaudeKey: data.hasClaudeKey || false,
          hasLlamaKey: data.hasLlamaKey || false
        }));
        
        // SECURITY: Log warning if keys were returned
        if (openaiKey && openaiKey !== '***configured***' && openaiKey.length > 10) {
          console.error('⚠️ SECURITY WARNING: OpenAI key was returned in API response!');
        }
        if (claudeKey && claudeKey !== '***configured***' && claudeKey.length > 10) {
          console.error('⚠️ SECURITY WARNING: Claude key was returned in API response!');
        }
        if (llamaKey && llamaKey !== '***configured***' && llamaKey.length > 10) {
          console.error('⚠️ SECURITY WARNING: Llama key was returned in API response!');
        }
      }
    } catch (err) {
      console.error('Failed to load admin settings:', err);
      // If endpoint doesn't exist yet, use localStorage as fallback (for migration)
      const saved = localStorage.getItem('nova_xfinity_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // SECURITY: Remove any API keys from localStorage
          const { openaiKey, claudeKey, llamaKey, geminiKey, ...safeParsed } = parsed;
          if (openaiKey || claudeKey || llamaKey || geminiKey) {
            console.warn('⚠️ SECURITY: Removing API keys from localStorage');
            localStorage.setItem('nova_xfinity_settings', JSON.stringify(safeParsed));
          }
          setSettings(prev => ({ ...prev, ...safeParsed }));
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError('Unauthorized: Admin access required', 'FORBIDDEN');
      return;
    }

    setSaving(true);
    try {
      // SECURITY: Never send API keys to backend
      // API keys must be configured via environment variables only
      const response = await api.put('/api/admin/settings', {
        provider: settings.provider,
        focusKeyphrase: settings.focusKeyphrase || undefined
        // Note: API keys are NOT sent - they must be set via .env
      });

      if (response.data?.success) {
        alert('Admin settings saved successfully. Note: API keys must be configured via environment variables (.env file).');
        // Also update localStorage for backward compatibility (without keys)
        const safeSettings = {
          provider: settings.provider,
          focusKeyphrase: settings.focusKeyphrase
        };
        localStorage.setItem('nova_xfinity_settings', JSON.stringify(safeSettings));
      } else {
        throw new Error(response.data?.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save admin settings:', err);
      showError(err, 'NETWORK_ERROR');
      // Fallback to localStorage (without keys)
      const safeSettings = {
        provider: settings.provider,
        focusKeyphrase: settings.focusKeyphrase
      };
      localStorage.setItem('nova_xfinity_settings', JSON.stringify(safeSettings));
      alert('Settings saved locally (backend sync failed).');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  if (!isAdmin) {
    return html`
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    `;
  }

  if (loading) {
    return html`
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading admin settings...</p>
        </div>
      </div>
    `;
  }

  return html`
    <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 max-w-3xl mx-auto animate-fadeIn shadow-xl shadow-black/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Admin: Agent Infrastructure</h2>
        <p className="text-slate-400 font-medium">Configure system-wide AI provider settings and API keys.</p>
      </div>
      
      <${OnboardingBanner}
        id="admin-settings-welcome"
        title="Admin Settings"
        message="These settings control the global AI provider configuration. Changes affect all users. Google Gemini is enabled by default. Add API keys for other providers to unlock their features system-wide."
        icon="fa-shield-halved"
        type="warning"
      />
      
      <div className="space-y-10">
        <!-- Provider Selector -->
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Default System Provider</label>
            <${Tooltip} text="Choose the default AI provider for the system. Google Gemini is enabled by default. Users can override this in their personal preferences." position="bottom">
              <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
            </${Tooltip}>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${PROVIDER_OPTIONS.map(p => html`
              <button 
                key=${p.id}
                onClick=${() => handleSettingsChange({ provider: p.id })}
                className=${`p-5 rounded-2xl border-2 transition-all flex flex-col items-center group relative overflow-hidden ${settings.provider === p.id ? 'border-blue-600 bg-blue-900/30' : 'border-slate-700 hover:border-slate-600 bg-slate-800'}`}
              >
                <i className=${`fa-solid ${p.icon} text-2xl mb-3 ${settings.provider === p.id ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}></i>
                <span className=${`text-[9px] font-black uppercase tracking-tight ${settings.provider === p.id ? 'text-blue-500' : 'text-slate-400'}`}>${p.label}</span>
                <span className="mt-1 text-[7px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">${p.badge}</span>
              </button>
            `)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Gemini (Default)</label>
                <${Tooltip} text="Google Gemini is enabled by default and doesn't require an API key. It's integrated natively with the system." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="relative">
                <input type="text" readOnly value="Native Context System" className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 shadow-inner" />
                <i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>
              </div>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">OpenAI API Key</label>
                <${Tooltip} text="API keys must be configured via environment variables (.env file) for security. Set OPENAI_API_KEY in your .env file. Get your key from platform.openai.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  readOnly
                  value=${settings.hasOpenAIKey ? '••••••••••••••••••••••••••••••••' : 'Not configured'} 
                  className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs shadow-sm text-slate-400 cursor-not-allowed" 
                />
                ${settings.hasOpenAIKey ? html`<i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>` : ''}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">🔒 Configure via .env: OPENAI_API_KEY=sk-...</p>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Anthropic Claude Key</label>
                <${Tooltip} text="API keys must be configured via environment variables (.env file) for security. Set ANTHROPIC_API_KEY in your .env file. Get your key from console.anthropic.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  readOnly
                  value=${settings.hasClaudeKey ? '••••••••••••••••••••••••••••••••' : 'Not configured'} 
                  className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs shadow-sm text-slate-400 cursor-not-allowed" 
                />
                ${settings.hasClaudeKey ? html`<i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>` : ''}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">🔒 Configure via .env: ANTHROPIC_API_KEY=sk-ant-...</p>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Groq / Llama API Key</label>
                <${Tooltip} text="API keys must be configured via environment variables (.env file) for security. Set GROQ_API_KEY in your .env file. Get your key from console.groq.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  readOnly
                  value=${settings.hasLlamaKey ? '••••••••••••••••••••••••••••••••' : 'Not configured'} 
                  className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs shadow-sm text-slate-400 cursor-not-allowed" 
                />
                ${settings.hasLlamaKey ? html`<i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>` : ''}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">🔒 Configure via .env: GROQ_API_KEY=gsk_...</p>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Default Focus Keyphrase</label>
            <${Tooltip} text="Set a default SEO focus keyphrase that will be used as a fallback for all generated content. Leave empty to let the AI generate context-appropriate keyphrases." position="top">
              <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
            </${Tooltip}>
          </div>
          <input 
            type="text" 
            placeholder="e.g., Enterprise WordPress SEO, React Best Practices, AI Content Generation" 
            value=${settings.focusKeyphrase || ''} 
            onChange=${e => handleSettingsChange({ focusKeyphrase: e.target.value })} 
            className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-900/50 font-bold text-white text-sm outline-none transition-all shadow-sm placeholder-slate-500" 
          />
          <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Set a global keyphrase to ensure consistent SEO focus across all generated articles.</p>
        </div>

        <button 
          onClick=${handleSave} 
          disabled=${saving}
          className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-black/50 border border-blue-700"
        >
          ${saving ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
          Save Admin Settings
        </button>
      </div>
    </div>
  `;
};

export default AdminSettingsPage;
